"use client"

import React, { useEffect, useState } from 'react'
import toast from "react-hot-toast";

import 'react-confirm-alert/src/react-confirm-alert.css';

import { MdOutlineSupervisedUserCircle } from "react-icons/md"
import { Calendar } from 'primereact/calendar';
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import { Steps } from 'uiw';

export default function Overview() {
    const [overViews, setOverViews] = useState([]);
    const [sumActual, setSumActual] = useState('-')
    const [sumBudget, setSumBudget] = useState('-')
    const [sumDiference, setSumDiference] = useState('-')
    const [sumPercentBudget, setSumPercentBudget] = useState(Number)
    const [salaryBudget, setSalaryBudget] = useState('-');
    const [profitPercentBudget, setProfitPercentBudget] = useState('-');
    const [profitBudget, setProfitBudget] = useState('-');
    const [fromDate, setFromDate] = useState(new Date());
    const [dataChart, setData] = useState([]);

    function objToQueryString(obj: any) {
        const keyValuePairs = [];
        for (const key in obj) {
            keyValuePairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
        }
        return keyValuePairs.join('&');
    }
    const getSumAmountExpense = async () => {
        let dateNow = fromDate.getFullYear();
        let yearNow = dateNow.toString();
        const queryString = objToQueryString({
            requestDate: yearNow,
        });
        fetch(`/api/finance/overview/list?${queryString}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        }).then(async (res: any) => {
            let data = await res.json();
            let overViewArray: any = [];
            const expenseBudgets: any = data.expenseBudgets;
            const sumAmountExpenses: any = data.sumAmount;
            const sumAmountIncome: any = data.sumIncome[0];
            const sumAmountAllType: any = data.sumAmountAllType[0];

            let sumPercentBudget = 0;
            for (var i = 0; i < expenseBudgets.length; i++) {
                let overViewObject = {
                    expenses: '-',
                    actual: '-',
                    percentActual: '-',
                    budget: '-',
                    percentBudget: '-',
                    difference: '-'
                }
                let expenseBudget = expenseBudgets[i];
                overViewObject.expenses = expenseBudget.type;
                let budget = (Number(sumAmountIncome.sumAmount) * Number(expenseBudget.value)) / 100
                if (budget) {
                    overViewObject.budget = budget.toString();
                }
                overViewObject.percentBudget = expenseBudget.value;
                sumPercentBudget += Number(expenseBudget.value);
                for (var j = 0; j < sumAmountExpenses.length; j++) {
                    let expense = sumAmountExpenses[j];
                    if (expense.type == expenseBudget.type) {
                        overViewObject.actual = expense.sumAmount;
                        if (budget) {
                            let difference = Number(budget) - Number(expense.sumAmount);
                            overViewObject.difference = difference.toString();
                        }

                        let pActual = (Number(expense.sumAmount) / Number(sumAmountAllType.sumAmount)) * 100
                        let pActual2 = Math.floor(pActual * 10) / 10
                        overViewObject.percentActual = pActual2.toString();
                    }
                }

                overViewArray.push(overViewObject);
            }

            setOverViews(overViewArray);
            if (sumAmountAllType.sumAmount) {
                setSumActual(sumAmountAllType.sumAmount);
            } else {
                setSumActual('-')
            }

            if (sumAmountIncome.sumAmount) {
                setSumBudget(sumAmountIncome.sumAmount);
            } else {
                setSumActual('-')
            }

            if (sumAmountAllType.sumAmount && sumAmountIncome.sumAmount) {
                let result = Number(sumAmountIncome.sumAmount) - Number(sumAmountAllType.sumAmount);
                setSumDiference(result.toString());
            } else {
                setSumActual('-')
            }

            setSumPercentBudget(sumPercentBudget);
        });
    };

    const getdataAmchart = async () => {
        let dateNow = fromDate.getFullYear();
        let yearNow = dateNow.toString();
        let arrayChartData: any = [];
        let arrayMonth = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
        for (var i = 1; i <= 12; i++) {
            let chartObject = {
                time: yearNow + "-" + arrayMonth[i - 1],
                actual: null,
                budget: null,
            }
            const queryString = objToQueryString({
                requestMonth: i.toString(),
                requestDate: yearNow,
            });
            let res = await fetch(`/api/finance/overview/list?${queryString}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            let data = await res.json();
            let sumAmountAllType = data.sumAmountAllType[0];
            const sumAmountIncome: any = data.sumIncome[0];
            if (sumAmountAllType.sumAmount) {
                chartObject.actual = sumAmountAllType.sumAmount;
            }
            if (sumAmountIncome.sumAmount) {
                chartObject.budget = sumAmountIncome.sumAmount;
            }
            arrayChartData.push(chartObject);
        }

        // setData(arrayChartData);

        initChart(arrayChartData);
    }

    const searchdataAmchart = async (year: any) => {
        let arrayChartData: any = [];
        let arrayMonth = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
        for (var i = 1; i <= 12; i++) {
            let chartObject = {
                time: year + "-" + arrayMonth[i - 1],
                actual: null,
                budget: null,
            }
            const queryString = objToQueryString({
                requestMonth: i.toString(),
                requestDate: year,
            });
            let res = await fetch(`/api/finance/overview/list?${queryString}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            let data = await res.json();
            let sumAmountAllType = data.sumAmountAllType[0];
            const sumAmountIncome: any = data.sumIncome[0];
            if (sumAmountAllType.sumAmount) {
                chartObject.actual = sumAmountAllType.sumAmount;
            }
            if (sumAmountIncome.sumAmount) {
                chartObject.budget = sumAmountIncome.sumAmount;
            }
            arrayChartData.push(chartObject);
        }

        // setData(arrayChartData);
        initChart(arrayChartData);
    }

    const searchOverView = (event: any) => {
        const newYear = new Date(event.target.value).getFullYear();

        const queryString = objToQueryString({
            requestDate: newYear.toString(),
        });
        fetch(`/api/finance/overview/list?${queryString}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        }).then(async (res: any) => {
            let data = await res.json();
            let overViewArray: any = [];
            const expenseBudgets: any = data.expenseBudgets;
            const sumAmountExpenses: any = data.sumAmount;
            const sumAmountIncome: any = data.sumIncome[0];
            const sumAmountAllType: any = data.sumAmountAllType[0];

            let sumPercentBudget = 0;
            for (var i = 0; i < expenseBudgets.length; i++) {
                let overViewObject = {
                    expenses: '-',
                    actual: '-',
                    percentActual: '-',
                    budget: '-',
                    percentBudget: '-',
                    difference: '-'
                }
                let expenseBudget = expenseBudgets[i];
                overViewObject.expenses = expenseBudget.type;
                let budget = (Number(sumAmountIncome.sumAmount) * Number(expenseBudget.value)) / 100
                if (budget) {
                    overViewObject.budget = budget.toString();
                }
                overViewObject.percentBudget = expenseBudget.value;
                sumPercentBudget += Number(expenseBudget.value);
                for (var j = 0; j < sumAmountExpenses.length; j++) {
                    let expense = sumAmountExpenses[j];
                    if (expense.type == expenseBudget.type) {
                        overViewObject.actual = expense.sumAmount;
                        if (budget) {
                            let difference = Number(budget) - Number(expense.sumAmount);
                            overViewObject.difference = difference.toString();
                        }

                        let pActual = (Number(expense.sumAmount) / Number(sumAmountAllType.sumAmount)) * 100
                        let pActual2 = Math.floor(pActual * 10) / 10
                        overViewObject.percentActual = pActual2.toString();
                    }
                }

                overViewArray.push(overViewObject);
            }

            setOverViews(overViewArray);
            if (sumAmountAllType.sumAmount) {
                setSumActual(sumAmountAllType.sumAmount);
            } else {
                setSumActual('-')
            }

            if (sumAmountIncome.sumAmount) {
                setSumBudget(sumAmountIncome.sumAmount);
            } else {
                setSumBudget('-')
            }

            if (sumAmountAllType.sumAmount && sumAmountIncome.sumAmount) {
                let result = Number(sumAmountIncome.sumAmount) - Number(sumAmountAllType.sumAmount);
                setSumDiference(result.toString());
            } else {
                setSumDiference('-')
            }

            setSumPercentBudget(sumPercentBudget);

            searchdataAmchart(newYear.toString());
        });
    }

    // Init search
    useEffect(() => {
        getSumAmountExpense();
        getdataAmchart();
    }, []);

    const convertNumberToLocalString = (number: Number) => {
        let nb = Number(number);
        let result = nb.toLocaleString("en-US");
        return result;
    }

    const capitalize = (s: any) => {
        let results = s.split('_');
        let cap = '';
        for (var i = 0; i < results.length; i++) {
            let str = results[i].toLowerCase();
            const str2 = str.charAt(0).toUpperCase() + str.slice(1);
            cap = cap + ' ' + str2;
        }

        return cap;
    }

    const changePercentBudget = (event: any) => {
        let value = event.target.value
        if (sumPercentBudget + Number(value) > 100) {
            toast.error("tổng phần trăm budget không được quá 100%");
            setSalaryBudget('-');
            return;
        } else {
            let salary = (Number(sumBudget) * Number(value)) / 100;
            let profitPercent = 100 - Number(sumPercentBudget) - Number(value);
            let profitBudget = (Number(sumBudget) * Number(profitPercent)) / 100;
            setProfitPercentBudget(profitPercent.toString());
            setProfitBudget(profitBudget.toString());
            setSalaryBudget(salary.toString());
        }
    }

    const initChart = (arrayChartData: []) => {
        am5.array.each(am5.registry.rootElements, function (root) {
            if (root.dom.id == "chartdiv") {
                root.dispose();
            }
        });
        /* Chart code */
        // Create root element
        // https://www.amcharts.com/docs/v5/getting-started/#Root_element
        let root = am5.Root.new("chartdiv");


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
            categoryField: "time",
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
            name: "Income",
            xAxis: xAxis,
            yAxis: yAxis,
            valueYField: "budget",
            categoryXField: "time"
        }));

        series.columns.template.setAll({
            tooltipText: "{name}, {categoryX}:{valueY}",
            width: am5.percent(90),
            tooltipY: 0,
            strokeOpacity: 0
        });

        series.data.setAll(data);

        // Make stuff animate on load
        // https://www.amcharts.com/docs/v5/concepts/animations/
        series.appear();

        series.bullets.push(function () {
            return am5.Bullet.new(root, {
                locationY: 0,
                sprite: am5.Label.new(root, {
                    text: "{valueY}",
                    fill: root.interfaceColors.get("alternativeText"),
                    centerY: 0,
                    centerX: am5.p50,
                    populateText: true
                })
            });
        });

        legend.data.push(series);

        let series2 = chart.series.push(am5xy.ColumnSeries.new(root, {
            name: "Expense",
            xAxis: xAxis,
            yAxis: yAxis,
            valueYField: "actual",
            categoryXField: "time",
        }));

        series2.columns.template.setAll({
            tooltipText: "{name}, {categoryX}:{valueY}",
            width: am5.percent(90),
            tooltipY: 0,
            strokeOpacity: 0,
            fill: am5.color(0xe4572e),
            stroke: am5.color(0xe4572e)
        });

        series2.data.setAll(data);

        // Make stuff animate on load
        // https://www.amcharts.com/docs/v5/concepts/animations/
        series2.appear();

        series2.bullets.push(function () {
            return am5.Bullet.new(root, {
                locationY: 0,
                sprite: am5.Label.new(root, {
                    text: "{valueY}",
                    fill: root.interfaceColors.get("alternativeText"),
                    centerY: 0,
                    centerX: am5.p50,
                    populateText: true,

                })
            });
        });

        legend.data.push(series2);

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
                            value={fromDate}
                            onChange={searchOverView}
                        />
                    </div>
                </div>
            </div>

            <div className="mx-auto mt-2">
                <div className="flex flex-col">
                    <div className="overflow-x-auto rounded-t-lg test-height">
                        <div className="inline-block w-full align-middle">
                            <div className="overflow-hidden ">
                                <table className="w-full divide-y divide-gray-200">
                                    <thead className="bg-light-blue">
                                        <tr>
                                            <th scope="col" className="w-[90px] p-2 border border-gray-300 bg-light-blue text-white 
                                                text-xs font-medium uppercase">
                                                EXPENSES
                                            </th>
                                            <th scope="col" className="w-[150px] p-2 border border-gray-300 bg-light-blue text-white 
                                                text-xs font-medium uppercase">
                                                Actual
                                            </th>
                                            <th scope="col" className="w-[10px] p-2 border border-gray-300 bg-light-blue text-white 
                                                text-xs font-medium uppercase">
                                                %
                                            </th>
                                            <th scope="col" className="w-[150px] p-2 border border-gray-300 bg-light-blue text-white 
                                                text-xs font-medium uppercase">
                                                Budget
                                            </th>
                                            <th scope="col" className="w-[10px] p-2 border border-gray-300 bg-light-blue text-white 
                                                text-xs font-medium uppercase">
                                                %
                                            </th>
                                            <th scope="col" className="w-[150px] p-2 border border-gray-300 bg-light-blue text-white 
                                                text-xs font-medium uppercase">
                                                Difference
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="bg-white">
                                        {
                                            overViews != null && overViews.length > 0 ? (
                                                <>
                                                    <tr className="hover:bg-gray-100" style={{ background: '#eb9e7e' }}>
                                                        <td className={`p-2 text-sm font-normal 
                                                                text-gray-900 border border-gray-300`}>
                                                            <span>Tổng</span>
                                                        </td>

                                                        <td className={`p-2 text-sm font-normal 
                                                                text-gray-900 border border-gray-300 text-right`}>
                                                            <span>{sumActual == '-' ? '-' : convertNumberToLocalString(Number(sumActual))}</span>
                                                        </td>

                                                        <td className={`p-2 text-sm font-normal 
                                                                text-gray-900 border border-gray-300 text-right`}>
                                                            <span>-</span>
                                                        </td>

                                                        <td className={`p-2 text-sm font-normal 
                                                                text-gray-900 border border-gray-300 text-right`}>
                                                            <span>{sumBudget == '-' ? '-' : convertNumberToLocalString(Number(sumBudget))}</span>
                                                        </td>

                                                        <td className={`p-2 text-sm font-normal 
                                                                text-gray-900 border border-gray-300 text-right`}>
                                                            <span>-</span>
                                                        </td>

                                                        <td className={`p-2 text-sm font-normal 
                                                                text-gray-900 border border-gray-300 text-right`}>
                                                            <span>{sumDiference == '-' ? '-' : convertNumberToLocalString(Number(sumDiference))}</span>
                                                        </td>
                                                    </tr>
                                                    {
                                                        overViews.map((overView: any, index: any) => (
                                                            <tr className="hover:bg-gray-100" key={"overview-" + index}>
                                                                <td className={`p-2 text-sm font-normal 
                                                                    text-gray-900 border border-gray-300`}>
                                                                    <span>{capitalize(overView.expenses)}</span>
                                                                </td>

                                                                <td className={`p-2 text-sm font-normal 
                                                                    text-gray-900 border border-gray-300 text-right`}>
                                                                    <span>{overView.actual == '-' ? '-' : convertNumberToLocalString(overView.actual)}</span>
                                                                </td>

                                                                <td className={`p-2 text-sm font-normal 
                                                                    text-gray-900 border border-gray-300 text-right`}>
                                                                    <span>{overView.percentActual}</span>
                                                                </td>

                                                                <td className={`p-2 text-sm font-normal 
                                                                    text-gray-900 border border-gray-300 text-right`}>
                                                                    <span>{overView.budget == '-' ? '-' : convertNumberToLocalString(overView.budget)}</span>
                                                                </td>

                                                                <td className={`p-2 text-sm font-normal 
                                                                    text-gray-900 border border-gray-300 text-right`}>
                                                                    <span>{overView.percentBudget}</span>
                                                                </td>

                                                                <td className={`p-2 text-sm font-normal 
                                                                    text-gray-900 border border-gray-300 text-right`}>
                                                                    <span>{overView.difference == '-' ? '-' : convertNumberToLocalString(overView.difference)}</span>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    }
                                                    <tr className="hover:bg-gray-100">
                                                        <td className={`p-2 text-sm font-normal 
                                                                text-gray-900 border border-gray-300`}>
                                                            <span>Salary Increase</span>
                                                        </td>

                                                        <td className={`p-2 text-sm font-normal 
                                                                text-gray-900 border border-gray-300 text-right`}>
                                                            <span>-</span>
                                                        </td>

                                                        <td className={`p-2 text-sm font-normal 
                                                                text-gray-900 border border-gray-300 text-right`}>
                                                            <span>-</span>
                                                        </td>

                                                        <td className={`p-2 text-sm font-normal 
                                                                text-gray-900 border border-gray-300 text-right`}>
                                                            <span>{salaryBudget == '-' ? '-' : convertNumberToLocalString(Number(salaryBudget))}</span>
                                                        </td>

                                                        <td className={`p-2 text-sm font-normal 
                                                                text-gray-900 border border-gray-300 text-right`}>
                                                            <input type="text" className={`py-1 px-1 block w-full border border-gray-200 text-sm focus:z-10 text-center 
                                                                focus:border-gray-300 focus:outline-none text-right`}
                                                                name="value"
                                                                onChange={changePercentBudget} />
                                                        </td>

                                                        <td className={`p-2 text-sm font-normal 
                                                                text-gray-900 border border-gray-300 text-right`}>
                                                            <span>-</span>
                                                        </td>
                                                    </tr>

                                                    <tr className="hover:bg-gray-100">
                                                        <td className={`p-2 text-sm font-normal 
                                                                text-gray-900 border border-gray-300`}>
                                                            <span>Profit</span>
                                                        </td>

                                                        <td className={`p-2 text-sm font-normal 
                                                                text-gray-900 border border-gray-300 text-right`}>
                                                            <span>-</span>
                                                        </td>

                                                        <td className={`p-2 text-sm font-normal 
                                                                text-gray-900 border border-gray-300 text-right`}>
                                                            <span>-</span>
                                                        </td>

                                                        <td className={`p-2 text-sm font-normal 
                                                                text-gray-900 border border-gray-300 text-right`}>
                                                            <span>{profitBudget == '-' ? '-' : convertNumberToLocalString(Number(profitBudget))}</span>
                                                        </td>

                                                        <td className={`p-2 text-sm font-normal 
                                                                text-gray-900 border border-gray-300 text-right`}>
                                                            <span>{profitPercentBudget}</span>
                                                        </td>

                                                        <td className={`p-2 text-sm font-normal 
                                                                text-gray-900 border border-gray-300 text-right`}>
                                                            <span>-</span>
                                                        </td>
                                                    </tr>

                                                </>
                                            ) : (
                                                <tr className="">
                                                    <td colSpan={6} className="p-2 text-sm font-normal text-center border border-gray-300">
                                                        No Data
                                                    </td>
                                                </tr>
                                            )
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div id='chartdiv' style={{ width: '100%', height: '300px' }} className='mt-4'>
                        </div>
                    </div>
                </div>
            </div >



        </>
    )
}