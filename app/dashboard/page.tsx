"use client"

import React, { useEffect, useState } from 'react'
import toast from "react-hot-toast";

import 'react-confirm-alert/src/react-confirm-alert.css';

import { MdOutlineSupervisedUserCircle } from "react-icons/md"
import { Calendar } from 'primereact/calendar';
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import * as am5percent from "@amcharts/amcharts5/percent";
import { Steps } from 'uiw';
import moment from "moment-timezone";

import "primereact/resources/themes/lara-light-indigo/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";                                //icons

export default function Dashboard() {

  const [newDate, setNewDate] = useState(new Date());
  const [projects, setProjects] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);
  const [listCurrency, setListCurrency] = useState([]);

  function objToQueryString(obj: any) {
    const keyValuePairs = [];
    for (const key in obj) {
      keyValuePairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
    }
    return keyValuePairs.join('&');
  }

  const init = async () => {
    let dateNow = newDate.getFullYear();
    let yearNow = dateNow.toString();
    const queryString = objToQueryString({
      newYear: yearNow,
    });

    fetch(`/api/currency/list`, {
      method: "GET",
      headers: {
          "Content-Type": "application/json",
      }
    }).then(async (res: any) => {
        let data = await res.json();
        const currencyMap = new Map();
        for (let y = 0; y < data.currencyRate.length; y++) {
          let currency = data.currencyRate[y];
          currencyMap.set(currency.currency, currency.rate);
        }

        fetch(`/api/dashboard/list?${queryString}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        }).then(async (res: any) => {
          let data = await res.json();
          const projects = data.projects;
    
          const queryStringMasterData = objToQueryString({
            key: 'project_cost_rate',
          });
          await fetch(`/api/dashboard/listMasterData?${queryStringMasterData}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            }
          }).then(async (res: any) => {
            let data = await res.json();
            let valueMaster = data.insightMaster[0].value;
            const projectList: any = [];
            for (let i = 0; i < projects.length; i++) {
              let project = projects[i];
              
              let currency = currencyMap.get(project.currency);

              if (project.currency != 'VND') {
                project.cost = Number(project.cost) * currency;
              }
              const queryStringResourceAllocation = objToQueryString({
                projectId: project.id,
                page: 1,
                maxResult: 1000,
              });
              await fetch(`/api/project/resource-allocation/list?${queryStringResourceAllocation}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                }
              }).then(async (res: any) => {
                let data = await res.json();
                let bEffort = 0;
                let diff = 0;
                for (let j = 0; j < data.resourceAllocations.length; j++) {
                  let result = data.resourceAllocations[j];
                  bEffort += result.mm * result.salary;
                }
                let project = { ...projects[i], "costActual": bEffort };
                
                project.costBudget = (Number(project.cost) * valueMaster) / 100;
    
                if (bEffort > 0) { 
                  diff = Number(project.costBudget) - Number(bEffort);
                }
                project = { ...project, "diff": diff };
    
                projectList.push(project);
              });
            }
            setProjects(projectList)
    
            initChart(projectList);
            initChartXY(projectList);
          });
        });
    })

    
  }


  const initEmployee = async () => {
    let dateNow = newDate.getFullYear();
    let yearNow = dateNow.toString();
    const queryStringMasterData = objToQueryString({
      key: 'member_max_effort',
    });
    await fetch(`/api/dashboard/listMasterData?${queryStringMasterData}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(async (res: any) => {
      let data = await res.json();
      let valueMaster = data.insightMaster[0].value;

      fetch(`/api/dashboard/listEmployee`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      }).then(async (res: any) => {
        let data = await res.json();
        let arrayMonth = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
        let employeeList: any = [];
        for (let i = 0; i < data.employees.length; i++) {
          let employee = data.employees[i];
          let employeeId = employee.id;

          let fromMonth = '01-' + yearNow;
          let toMonth = '12-' + yearNow;

          const queryStringCurrentResource = objToQueryString({
            employeeId: employeeId,
            fromMonth: fromMonth,
            toMonth: toMonth,
          });
          await fetch(`/api/dashboard/listCurrentResource?${queryStringCurrentResource}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            }
          }).then(async (res: any) => {
            let data = await res.json();
            let currentResources = data.currentResource;

            for (let j = 1; j <= 12; j++) {
              let sPlanEffort = null;
              let month = arrayMonth[j - 1].toString();

              let totalValidDays = getTotalValidDaysInMonth(yearNow, month);
              let remainEffort = valueMaster * totalValidDays;

              let sumplanEffort = 0;
              for (let e = 0; e < currentResources.length; e++) {
                let currentResource = currentResources[e];
                let date = moment.utc(currentResource.date).tz("Asia/Ho_Chi_Minh").format('MM');
                if (date == month) {
                  sumplanEffort = sumplanEffort + currentResource.planEffort;
                }
              }

              if (sumplanEffort > 0) {
                sPlanEffort = ((Number(remainEffort) - Number(sumplanEffort)) / remainEffort) * 100;
                if (sPlanEffort < 0) {
                  sPlanEffort = 0;
                } else {
                  let sPlanEffort2 = 100 - (Math.round(sPlanEffort * 100) / 100);
                  sPlanEffort = Math.round(sPlanEffort2 * 100) / 100;
                }
              }
              employee = { ...employee, ['T' + month]: sPlanEffort };
            }
          });
          employeeList.push(employee);
        }

        setEmployeesList(employeeList);
      });

    });
  }

  // Init search
  useEffect(() => {
    init();
    initEmployee();
  }, []);

  function getTotalValidDaysInMonth(year: any, month: any) {
    // Tạo ngày đầu tháng
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0); // Ngày cuối tháng

    let validDaysCount = 0;

    for (let day = firstDayOfMonth; day <= lastDayOfMonth; day.setDate(day.getDate() + 1)) {
      const dayOfWeek = day.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        validDaysCount++;
      }
    }

    return validDaysCount;
  }

  const countDiff = (costBudget: any, costActual: any) => {

    if (costBudget && costActual != 0) {
      let diff = Number(costBudget) - Number(costActual);
      let result = diff.toLocaleString("en-US");
      return result + ' ₫';
    }

    return '-'
  }

  const countEE = (costActual: any, cost: any) => {

    if (cost && costActual != 0) {
      let ee = Number(costActual) / Number(cost) * 100;
      let result = ee.toLocaleString("en-US");
      return result + ' %';
    }

    return '-'
  }

  const convertNumberToLocalString = (number: Number) => {
    if (number) {
      let nb = Number(number);
      let result = nb.toLocaleString("en-US");
      return result + ' ₫';
    }
    return '-'
  }

  const searchDashBoard = async (event: any) => {
    const newYear = new Date(event.target.value).getFullYear();
    searchProjects(newYear);
    searchEmployee(newYear);
  }

  const searchProjects = async (newYear: any) => {
    const queryString = objToQueryString({
      newYear: newYear,
    });
    await fetch(`/api/dashboard/list?${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(async (res: any) => {
      let data = await res.json();
      const projects = data.projects;


      const projectList: any = [];
      for (let i = 0; i < projects.length; i++) {
        let project = projects[i];

        const queryStringResourceAllocation = objToQueryString({
          projectId: project.id,
          page: 1,
          maxResult: 1000,
        });
        await fetch(`/api/project/resource-allocation/list?${queryStringResourceAllocation}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        }).then(async (res: any) => {
          let data = await res.json();
          let bEffort = 0;
          for (let j = 0; j < data.resourceAllocations.length; j++) {
            let result = data.resourceAllocations[j];
            bEffort += result.mm * result.salary;
          }
          let project = { ...projects[i], "costActual": bEffort };

          projectList.push(project);
        });
      }
      setProjects(projectList)

    });
  }

  const searchEmployee = async (newYear: any) => {
    let yearNow = newYear.toString();
    const queryStringMasterData = objToQueryString({
      key: 'member_max_effort',
    });
    await fetch(`/api/dashboard/listMasterData?${queryStringMasterData}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(async (res: any) => {
      let data = await res.json();
      let valueMaster = data.insightMaster[0].value;

      fetch(`/api/dashboard/listEmployee`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      }).then(async (res: any) => {
        let data = await res.json();
        let arrayMonth = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
        let employeeList: any = [];
        for (let i = 0; i < data.employees.length; i++) {
          let employee = data.employees[i];
          let employeeId = employee.id;
          for (let j = 1; j <= 12; j++) {
            let sPlanEffort = null;
            let date = arrayMonth[j - 1] + '-' + yearNow;
            let month = arrayMonth[j - 1].toString();
            let totalValidDays = getTotalValidDaysInMonth(yearNow, month);
            let remainEffort = valueMaster * totalValidDays;
            const queryStringCurrentResource = objToQueryString({
              employeeId: employeeId,
              date: date,
            });
            await fetch(`/api/dashboard/listCurrentResource?${queryStringCurrentResource}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              }
            }).then(async (res: any) => {
              let data = await res.json();
              let totalPlanEffort = data.currentResource[0].sumPlanEffort;
              if (totalPlanEffort) {
                sPlanEffort = (Number(remainEffort) - Number(totalPlanEffort)) / remainEffort;
                if (sPlanEffort < 0) {
                  sPlanEffort = 0;
                } else {
                  let sPlanEffort2 = 100 - (Math.round(sPlanEffort * 100) / 100);
                  sPlanEffort = Math.round(sPlanEffort2 * 100) / 100;
                }
              }
            });
            employee = { ...employee, ['T' + month]: sPlanEffort };
          }
          employeeList.push(employee);
        }
        setEmployeesList(employeeList);
      });

    });
  }

  const initChart = (arrayChartData: []) => {
    am5.array.each(am5.registry.rootElements, function (root) {
      if (root?.dom.id == "chartdiv") {
        root.dispose();
      }
    });
    let root = am5.Root.new("chartdiv");


    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([
      am5themes_Animated.new(root)
    ]);


    // Create chart
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/
    let chart = root.container.children.push(am5percent.PieChart.new(root, {
      layout: root.verticalLayout
    }));


    // Create series
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Series
    let series = chart.series.push(am5percent.PieSeries.new(root, {
      valueField: "cost",
      categoryField: "name",
      legendValueText: "[bold {name}]"
    }));

    series.get("colors")?.set("colors", [
      am5.color(0x52b69a),
      am5.color(0xf44e4e),
      am5.color(0xf2f298)
    ]);

    // Set data
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data
    series.data.setAll(arrayChartData);


    // Create legend
    // https://www.amcharts.com/docs/v5/charts/percent-charts/legend-percent-series/
    let legend = chart.children.push(am5.Legend.new(root, {
      centerX: am5.percent(50),
      x: am5.percent(50),
      marginTop: 15,
      marginBottom: 15
    }));

    legend.data.setAll(series.dataItems);


    // Play initial series animation
    // https://www.amcharts.com/docs/v5/concepts/animations/#Animation_of_series
    series.appear(1000, 100);
  }

  const initChartXY = (arrayChartData: []) => {
    am5.array.each(am5.registry.rootElements, function (root) {
        if (root?.dom.id == "chartdiv-xy") {
            root.dispose();
        }
    });

    let root = am5.Root.new("chartdiv-xy");
    // Set themes
        // https://www.amcharts.com/docs/v5/concepts/themes/
        root.setThemes([
          am5themes_Animated.new(root)
      ]);


      // Create chart
      // https://www.amcharts.com/docs/v5/charts/xy-chart/
      const chart = root.container.children.push(am5xy.XYChart.new(root, {
          panX: false,
          panY: false,
          wheelX: "panX",
          wheelY: "zoomX",
          layout: root.verticalLayout
      }));


      // Add legend
      // https://www.amcharts.com/docs/v5/charts/xy-chart/legend-xy-series/
      let legend = chart.children.push(
          am5.Legend.new(root, {
              centerX: am5.p50,
              x: am5.p50
          })
      );

      let data = arrayChartData;


      // Create axes
      // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
      let xRenderer = am5xy.AxisRendererX.new(root, {
          cellStartLocation: 0.1,
          cellEndLocation: 0.9,
          strokeOpacity: 1,
          strokeWidth: 1
      })

      let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
          categoryField: "name",
          renderer: xRenderer,
          tooltip: am5.Tooltip.new(root, {})
      }));

      xRenderer.grid.template.setAll({
          location: 0,
      })

      xAxis.data.setAll(data);

      var label1 = am5.Label.new(root, {
          text: "Số tiền (đ)",
          rotation: -90,
          y: am5.p50,
          fontSize: 20,
          fontWeight: 'bold',
          centerX: am5.p50
      })

      let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
          renderer: am5xy.AxisRendererY.new(root, {
              strokeOpacity: 1,
              strokeWidth: 1
          })
      }));

      yAxis.children.unshift(
          label1
      );

      let series = chart.series.push(am5xy.ColumnSeries.new(root, {
          name: "name",
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "diff",
          categoryXField: "name"
      }));

      series.columns.template.setAll({
          tooltipText: "{categoryX}:{valueY}",
          width: am5.percent(90),
          tooltipY: 0,
          strokeOpacity: 0
      });

      series.data.setAll(data);
      series.columns.template.adapters.add("fill", function(fill, target) {
        return chart.get("colors")?.getIndex(series.columns.indexOf(target));
      });
      
      series.columns.template.adapters.add("stroke", function(stroke, target) {
        return chart.get("colors")?.getIndex(series.columns.indexOf(target));
      });

      chart.get("colors")?.set("colors", [
        am5.color(0x52b69a),
        am5.color(0xf44e4e),
        am5.color(0xf2f298),
        am5.color(0x86a873),
        am5.color(0xbb9f06)
      ]);

      // Make stuff animate on load
      // https://www.amcharts.com/docs/v5/concepts/animations/
      series.appear();

      // series.bullets.push(function () {
      //     return am5.Bullet.new(root, {
      //         locationY: 0,
      //         sprite: am5.Label.new(root, {
      //             text: "{valueY}",
      //             fill: root.interfaceColors.get("alternativeText"),
      //             centerY: 0,
      //             centerX: am5.p50,
      //             populateText: true
      //         })
      //     });
      // });

      // legend.data.push(series);

      chart.appear(1000, 100);
}

  return (
    <>
      <div className={``}>
        <div className="text-lg flex items-center gap-x-4 cursor-pointer rounded-md">
          <span className='text-3xl block float-left'><MdOutlineSupervisedUserCircle /></span>
          <h1>OverView</h1>
        </div>
      </div>
      <hr className="border-1 border-gray-500 drop-shadow-xl mt-1 mb-2" />

      <div className="flex justify-between xl:w-full">
        <div className="flex justify-center">
          <div className="w-100 flex-none relative">
            <Calendar
              id="search-for-year" placeholder='Year' showIcon showButtonBar
              className={`calendar-picker cell-calendar-picker search-calendar-picker border
                            border-gray-300`}
              view={"year"}
              dateFormat="yy"
              value={newDate}
              onChange={searchDashBoard}
            />
          </div>
        </div>
      </div>

      <div className='w-full mt-2 pr-2 inline-flex flex-col items-center justify-middle h-[calc(100vh-150px)] overflow-y-auto'>
        <div className="w-full" style={{}}>
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-light-blue">
              <tr>
                <th scope="col" className="w-[50px] p-2 border border-gray-300 bg-light-blue text-white 
                  text-xs font-medium uppercase">
                  No
                </th>
                <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                  text-xs font-medium uppercase">
                  Project Name
                </th>
                <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                  text-xs font-medium uppercase">
                  Customer Name
                </th>
                <th scope="col" className="w-[100px] p-2 border border-gray-300 bg-light-blue text-white 
                  text-xs font-medium uppercase">
                  Start Date
                </th>
                <th scope="col" className="w-[100px] p-2 border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase">
                  End Date
                </th>
                <th scope="col" className="w-[150px] p-2 border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase">
                  Cost
                </th>
                <th scope="col" className="w-[150px] p-2 border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase">
                  Cost Budget
                </th>
                <th scope="col" className="w-[150px] p-2 border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase">
                  Cost Actual
                </th>
                <th scope="col" className="w-[150px] p-2 border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase">
                  Diff
                </th>
                <th scope="col" className="w-[70px] p-2 border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase">
                  EE
                </th>
              </tr>
            </thead>

            <tbody className="bg-white">
              {
                projects != null && projects.length > 0 ? (
                  <>
                    {
                      projects.map((project: any, index: any) => (
                        <tr className="hover:bg-gray-100" key={"project-" + index}>
                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300 text-center`}>
                            <span>{index + 1}</span>
                          </td>

                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300`}>
                            <span>{project.name}</span>
                          </td>

                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300 text-left`}>
                            <span>{project.customerName}</span>
                          </td>

                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300 text-center`}>
                            <span>{project.startDate}</span>
                          </td>

                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300 text-center`}>
                            <span>{project.endDate}</span>
                          </td>

                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300 text-right`}>
                            <span>{convertNumberToLocalString(Number(project.cost))}</span>
                          </td>

                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300 text-right`}>
                            <span>{convertNumberToLocalString(Number(project.costBudget))}</span>
                          </td>

                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300 text-right`}>
                            <span>{convertNumberToLocalString(Number(project.costActual))}</span>
                          </td>

                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300 text-right`}>
                            <span>{countDiff(project.costBudget, project.costActual)}</span>
                          </td>

                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300 text-right`}>
                            <span>{countEE(project.costActual, project.cost)}</span>
                          </td>
                        </tr>
                      ))
                    }

                  </>
                ) : (
                  <tr className="">
                    <td colSpan={10} className="p-2 text-sm font-normal text-center border border-gray-300">
                      No Data
                    </td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div >
        
        <div className='w-full mt-4'>
          <div id='chartdiv' className='inline-block h-[300px] border border-gray-300 xl:w-6/12 w-full'></div>

          <div id='chartdiv-xy' className='inline-block h-[300px] border border-gray-300 xl:w-6/12 w-full'></div>
        </div>
        

        <div className="w-full mt-2">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-light-blue">
              <tr>
                <th rowSpan={2} className="w-[50px] p-2 border border-gray-300 bg-light-blue text-white 
                  text-xs font-medium uppercase">
                  No
                </th>
                <th rowSpan={2} className="w-[150px] p-2 border border-gray-300 bg-light-blue text-white 
                  text-xs font-medium uppercase">
                  Member
                </th>
                <th rowSpan={2} className="w-[90px] p-2 border border-gray-300 bg-light-blue text-white 
                  text-xs font-medium uppercase">
                  Role
                </th>

                <th scope="col" colSpan={12} className="p-2 border border-gray-300 bg-light-blue text-white 
                  text-xs font-medium uppercase">
                  Available Effort (MM)
                </th>
              </tr>

              <tr>
                <th scope="col" className="p-2 text-sm font-normal 
                  text-white border border-gray-300 text-center">
                  Tháng 1
                </th>
                <th scope="col" className="p-2 text-sm font-normal 
                  text-white border border-gray-300 text-center">
                  Tháng 2
                </th>
                <th scope="col" className="p-2 text-sm font-normal 
                  text-white border border-gray-300 text-center">
                  Tháng 3
                </th>
                <th scope="col" className="p-2 text-sm font-normal 
                  text-white border border-gray-300 text-center">
                  Tháng 4
                </th>
                <th scope="col" className="p-2 text-sm font-normal 
                  text-white border border-gray-300 text-center">
                  Tháng 5
                </th>
                <th scope="col" className="p-2 text-sm font-normal 
                  text-white border border-gray-300 text-center">
                  Tháng 6
                </th>
                <th scope="col" className="p-2 text-sm font-normal 
                  text-white border border-gray-300 text-center">
                  Tháng 7
                </th>
                <th scope="col" className="p-2 text-sm font-normal 
                  text-white border border-gray-300 text-center">
                  Tháng 8
                </th>
                <th scope="col" className="p-2 text-sm font-normal 
                  text-white border border-gray-300 text-center">
                  Tháng 9
                </th>
                <th scope="col" className="p-2 text-sm font-normal 
                  text-white border border-gray-300 text-center">
                  Tháng 10
                </th>
                <th scope="col" className="p-2 text-sm font-normal 
                  text-white border border-gray-300 text-center">
                  Tháng 11
                </th>
                <th scope="col" className="p-2 text-sm font-normal 
                  text-white border border-gray-300 text-center">
                  Tháng 12
                </th>
              </tr>
            </thead>

            <tbody className="bg-white">
              {
                employeesList != null && employeesList.length > 0 ? (
                  <>
                    {
                      employeesList.map((employee: any, index: any) => (
                        <tr className="hover:bg-gray-100" key={"project-" + index}>
                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300 text-center`}>
                            <span>{index + 1}</span>
                          </td>

                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300`}>
                            <span>{employee.name}</span>
                          </td>

                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300 text-left`}>
                            <span>{employee.position}</span>
                          </td>

                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300 text-right`}>
                            <span>{employee?.T01 ?? 0}%</span>
                          </td>

                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300 text-right`}>
                            <span>{employee?.T02 ?? 0}%</span>
                          </td>

                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300 text-right`}>
                            <span>{employee?.T03 ?? 0}%</span>
                          </td>

                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300 text-right`}>
                            <span>{employee?.T04 ?? 0}%</span>
                          </td>

                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300 text-right`}>
                            <span>{employee?.T05 ?? 0}%</span>
                          </td>

                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300 text-right`}>
                            <span>{employee?.T06 ?? 0}%</span>
                          </td>

                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300 text-right`}>
                            <span>{employee?.T07 ?? 0}%</span>
                          </td>

                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300 text-right`}>
                            <span>{employee?.T08 ?? 0}%</span>
                          </td>

                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300 text-right`}>
                            <span>{employee?.T09 ?? 0}%</span>
                          </td>

                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300 text-right`}>
                            <span>{employee?.T10 ?? 0}%</span>
                          </td>

                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300 text-right`}>
                            <span>{employee?.T11 ?? 0}%</span>
                          </td>

                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300 text-right`}>
                            <span>{employee?.T12 ?? 0}%</span>
                          </td>

                        </tr>
                      ))
                    }

                  </>
                ) : (
                  <tr className="">
                    <td colSpan={15} className="p-2 text-sm font-normal text-center border border-gray-300">
                      No Data
                    </td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
