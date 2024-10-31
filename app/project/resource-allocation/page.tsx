"use client"
import React, { useEffect, useState, useContext } from 'react'
import { useFormik } from 'formik';
import moment from "moment-timezone";
import toast from "react-hot-toast";
import { MdOutlineClear, MdCancel, MdWorkOutline, MdNotes } from "react-icons/md";
import { BsPlusCircleFill } from "react-icons/bs";
import "primereact/resources/themes/lara-light-indigo/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";                                //icons
import { Calendar } from 'primereact/calendar';
import { FaInfoCircle, FaSave } from 'react-icons/fa';
import { RiDeleteBin2Fill, RiFileEditFill } from 'react-icons/ri';
import { GoProject } from 'react-icons/go';
import { confirmAlert } from 'react-confirm-alert';
import ConfirmBox from '@/components/confirm';
import * as yup from 'yup';
import { FiSend } from 'react-icons/fi';
import $ from "jquery"
import { platform } from 'os';
import Pagination from 'react-js-pagination';
import { useAppStore } from "@/lib/store";
import { useSession } from 'next-auth/react';

const initialEmployees = {
  employeeId: '',
  position: '',
  planEffort: '',
  startDate: new Date(),
  endDate: new Date(),
  mm: '',
  description: '',
}
export default function ResourceAllocation() {

  const session : any = useSession()

    const [isResourceAllocationRequest, setResourceAllocationRequest] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(1);
    const [maxResults, setMaxResults] = useState(10);
    const [projects, setProjects] = useState([]);
    const [resourceAllocations, setResourceAllocations] = useState([]);
    const [resourceAllocationsFilter, setResourceAllocationsFilter] = useState([]);
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [projectId, setProjectId] = useState(null);
    const [employeeId, setEmployeeId] = useState(null);
    const [typeSearch, setTypeSearch] = useState(2);
    const [hiddenProjectsSearch, setHiddenProjectsSearch] = useState(true);
    const [hiddenEmployeeSearch, setHiddenEmployeeSearch] = useState(true);
    const [plantEffortEdit, setPantEffortEdit] = useState(0);
    const [dataMaster, setDataMaster] = useState(0);

    const stateProject = useAppStore(state => state.projects);

    const handlePagination = async (page:any) => {
      setPage(page);
    }

    const formikAdd = useFormik({
        initialValues: initialEmployees,
        onSubmit: (target: any) => {
            let startDate = moment.utc(target.startDate).tz("Asia/Ho_Chi_Minh").format().replace("+07:00", "Z");
            let endDate = moment.utc(target.endDate).tz("Asia/Ho_Chi_Minh").format().replace("+07:00", "Z");
            let startDateForMat = moment.utc(target.startDate).tz("Asia/Ho_Chi_Minh").format('YYYY-MM-DD');
            let endDateForMat = moment.utc(target.endDate).tz("Asia/Ho_Chi_Minh").format('YYYY-MM-DD');
            if (new Date(startDateForMat).getTime() > new Date(endDateForMat).getTime()) {
              toast.error("EndDate phải lớn hơn StartDate");
              return;
            }
            if (target.employeeId == "") {
              target.employeeId = employeeId;
            }
            if (target.position == "") {
              target.position = "INTERN";
            }

            const condition = objToQueryString({
              projectId: projectId,
              employeeId: target.employeeId,
              fromDate: startDateForMat,
              toDate: endDateForMat,
            });

            fetch(`/api/currentresource/listCurrentByProject?${condition}`, { 
              method: "GET",
              headers: {
                  "Content-Type": "application/json",
              }
              }).then(async (res: any) => {
                let data = await res.json();
                if(data.currentResourceByProjectIdAndEmployeeId.length > 0) {
                  toast.error("Employee đã có việc trong thời gian này rồi!");
                  return;
                } else {
                  const queryString = objToQueryString({
                    employeeId: target.employeeId,
                    fromDate: startDateForMat,
                    toDate: endDateForMat,
                  });
                  fetch(`/api/currentresource/listSumPlanEffort?${queryString}`, { 
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
                    }).then(async (res: any) => {
                        let data = await res.json();
                        let currentResources = data.currentResource;
                        // kiểm tra xem nhân viên đó còn thời gian làm việc trong 1 ngày không
                        if (currentResources.length > 0) {
                          for (var i = 0; i < currentResources.length; i++) {
                            let currentResource = currentResources[i];
                            if ((Number(dataMaster) - Number(currentResource.planEffort)) < Number(target.planEffort)) {
                              toast.error("Employee Effort đã quá thời gian làm!");
                              return;
                            }
                          }
                          fetch("/api/project/resource-allocation/add", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                projectId: projectId,
                                employeeId: target.employeeId,
                                position: target.position,
                                planEffort: target.planEffort,
                                startDate: startDate,
                                endDate: endDate,
                                mm: target.mm,
                                description: target.description,
                            }),
                          }).then(async (res) => {
                            let dataResourceAllocation = await res.json();
                            setLoading(false);
                            if (res.status === 200) {
                              changeProjectOptionSearch(projectId);
                              //setMessage("");
                              toast.success("Send ResourceAllocation request successfully.");
                              setResourceAllocationRequest(false);
        
                              for (let currentDate = new Date(startDateForMat); currentDate <= target.endDate; currentDate.setDate(currentDate.getDate() + 1)) {
                                let newDate = moment.utc(currentDate).tz("Asia/Ho_Chi_Minh").format().replace("+07:00", "Z");
                                      let checkDateAdd: Number = currentDate.getDay();
                                      if (checkDateAdd != 0 && checkDateAdd != 6) {
                                        let remainEffort = Number(dataMaster) - target.planEffort;
                                        fetch("/api/currentresource/add", {
                                          method: "POST",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                          body: JSON.stringify({
                                              employeeId: target.employeeId,
                                              resource_allocation_id: dataResourceAllocation.resourceAllocation.id,
                                              planEffort: target.planEffort,
                                              date: newDate,
                                              remainEffort: remainEffort,
                                              description: target.description,
                                          }),
                                        }).then(async (res) => {
                                          setLoading(false);
                                          if (res.status === 200) {
                                          } else {
                                            toast.error(await res.text());
                                          }
                                        });
                                      }
                              }
                            } else {
                              toast.error(await res.text());
                            }
                          });
                          
                        } else {
                          fetch("/api/project/resource-allocation/add", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                              projectId: projectId,
                              employeeId: target.employeeId,
                              position: target.position,
                              planEffort: target.planEffort,
                              startDate: startDate,
                              endDate: endDate,
                              mm: target.mm,
                              description: target.description,
                          }),
                        }).then(async (res) => {
                          let dataResourceAllocation = await res.json();
                          setLoading(false);
                          if (res.status === 200) {
                            changeProjectOptionSearch(projectId);
                            //setMessage("");
                            toast.success("Send ResourceAllocation request successfully.");
                            setResourceAllocationRequest(false);

                            for (let currentDate = new Date(target.startDate); currentDate <= target.endDate; currentDate.setDate(currentDate.getDate() + 1)) {
                              let newDate = moment.utc(currentDate).tz("Asia/Ho_Chi_Minh").format().replace("+07:00", "Z");
                              let checkDateAdd: Number = currentDate.getDay();
                              if (checkDateAdd != 0 && checkDateAdd != 6) {
                                let remainEffort = Number(dataMaster) - target.planEffort;
                                fetch("/api/currentresource/add", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                      employeeId: target.employeeId,
                                      resource_allocation_id: dataResourceAllocation.resourceAllocation.id,
                                      planEffort: target.planEffort,
                                      date: newDate,
                                      remainEffort: remainEffort,
                                      description: target.description,
                                  }),
                                }).then(async (res) => {
                                  setLoading(false);
                                  if (res.status === 200) {
                                  } else {
                                    toast.error(await res.text());
                                  }
                                });
                              }
                            }
                          } else {
                            toast.error(await res.text());
                          }
                        });
                      }
                  })
                }
              });
            
        },
        validationSchema: yup.object({
            planEffort: yup.string().trim().required('Required'),
            mm: yup.string().trim().required('Required'),
        }),
      });

    const getProjects = async () => {
        const queryStringEmployee = objToQueryString({
          employeeId: session?.data?.user?.role === "MANAGER" ? session?.data?.user?.employee_id.toString() : ""
        });
        fetch(`/api/project/resource-allocation/list-project?${queryStringEmployee}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        }).then(async (res: any) => {
            let data = await res.json();
            
            setProjects(data.projects);
            setEmployeeId(data.employees[0].id)
            setEmployees(data.employees);
            setProjectId(data.projects[0].id);
            getResourceAllocation(data.projects[0]);
        })
    }

    const getMasterData = async () => {
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
        let dataMaster = data.insightMaster[0].value;
        setDataMaster(dataMaster);
      });
    }

    const getResourceAllocation = async (project: any) => {
        let projectId = project.id
        if (stateProject.id != 0) {
          projectId = stateProject.id
        }
        const queryString = objToQueryString({
            projectId: projectId,
            page: page,
            maxResult: 20,
          });
        fetch(`/api/project/resource-allocation/list?${queryString}`, { 
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
        }).then(async (res: any) => {
            let data = await res.json();
            setResourceAllocations(data.resourceAllocations);
            setResourceAllocationsFilter(data.resourceAllocations);
            setTotal(data.total);
            setMaxResults(data.maxResults);
        })
    }

    const changeProject = async (event: any) => {
      setResourceAllocationRequest(false);
      setCurrentIndex(-1);
      let projectId = event.target.value;
      setProjectId(projectId);
      const queryString = objToQueryString({
          employeeId: session?.data?.user?.role === "MANAGER" ? session?.data?.user?.employee_id.toString() : "",
          projectId: projectId,
          page: page,
          maxResult: 20,
        });
      fetch(`/api/project/resource-allocation/list?${queryString}`, { 
      method: "GET",
      headers: {
          "Content-Type": "application/json",
      }
      }).then(async (res: any) => {
          let data = await res.json();
          setResourceAllocations(data.resourceAllocations);
          setResourceAllocationsFilter(data.resourceAllocations);
      })
    }

    const changeProjectOptionSearch = async (projectId: any) => {
      setProjectId(projectId);
      const queryString = objToQueryString({
          employeeId: session?.data?.user?.role === "MANAGER" ? session?.data?.user?.employee_id.toString() : "",
          projectId: projectId,
          page: page,
          maxResult: 20,
        });
      fetch(`/api/project/resource-allocation/list?${queryString}`, { 
      method: "GET",
      headers: {
          "Content-Type": "application/json",
      }
      }).then(async (res: any) => {
          let data = await res.json();
          setResourceAllocations(data.resourceAllocations);
          setResourceAllocationsFilter(data.resourceAllocations);
      })
    }

    const searchProject = async (event: any) => {
      setResourceAllocationRequest(false);
      setCurrentIndex(-1);
      setHiddenProjectsSearch(false);
      var search = event.target.value;
        $('#refdocs_list li').each(function () {
          var val = $(this).text();
          $(this).toggle( !! val.match(search)).html(
          val.replace(search, function (match) {
              return '<mark>' + match + '</mark>'
          }));
      });
    }

    const searchProjectEmployee = async (event: any) => {
      setHiddenEmployeeSearch(false);
      setCurrentIndex(-1);
      setHiddenProjectsSearch(false);
      var search = event.target.value;
        $('#refdocs_list_employee li').each(function () {
          var val = $(this).text();
          $(this).toggle( !! val.match(search)).html(
          val.replace(search, function (match) {
              return '<mark>' + match + '</mark>'
          }));
      });
    }

    function objToQueryString(obj: any) {
        const keyValuePairs = [];
        for (const key in obj) {
          keyValuePairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
        }
        return keyValuePairs.join('&');
      }

    useEffect(() => {
        getProjects();
        getMasterData();
    }, [page]);

    const confirmResourceAllocation = async (id: any) => {

        const data = {
          icon: <GoProject />,
          title: "ResourceAllocation Delete",
          message: "Are you sure want to delete this ResourceAllocation?"
        }
    
        confirmAlert({
          customUI: ({ onClose}) => {
            return (
              <ConfirmBox data={data} onClose={onClose} onYes={() => deleteResourceAllocation({id})} onNo={() => console.log("NO")} />
            );
          }
        });
      };

    const deleteResourceAllocation = ({ id } : any) => {

    fetch("/api/project/resource-allocation/delete", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id
        }),
    }).then(async (res) => {
        if (res.status === 200) {
        const queryString = objToQueryString({
          resourceAllocationId: id
        });
        fetch(`/api/currentresource/delete?${queryString}`, { 
          method: "GET",
          headers: {
              "Content-Type": "application/json",
          }
          }).then(async (res: any) => {
            
          });
        changeProjectOptionSearch(projectId);
        setCurrentIndex(-1);
        toast.success("Delete ResourceAllocation information successfully.");
        } else {
        toast.error(await res.text());
        }
    });

    
    }
    
    const [ currentIndex, setCurrentIndex ] = useState(-1);

    const [ resourceAllocation, setResourceAllocation ] = useState({
        id: '',
        employeeId: '',
        position: '',
        planEffort: '',
        startDate: new Date(),
        endDate: new Date(),
        mm: '',
        description: '',
      });

    const formikUpdate = useFormik({
        initialValues: resourceAllocation,
        enableReinitialize: true,

        onSubmit: (target: any) => {
            let startDate = moment.utc(target.startDate).tz("Asia/Ho_Chi_Minh").format().replace("+07:00", "Z");
            let endDate = moment.utc(target.endDate).tz("Asia/Ho_Chi_Minh").format().replace("+07:00", "Z");
            let startDateForMat = moment.utc(target.startDate).tz("Asia/Ho_Chi_Minh").format('YYYY-MM-DD');
            let endDateForMat = moment.utc(target.endDate).tz("Asia/Ho_Chi_Minh").format('YYYY-MM-DD');
            if (new Date(startDate).getTime() > new Date(endDate).getTime()) {
              toast.error("EndDate phải lớn hơn StartDate");
              return;
            }

            const queryString = objToQueryString({
              employeeId: target.employeeId,
              fromDate: startDateForMat,
              toDate: endDateForMat,
            });
            fetch(`/api/currentresource/list?${queryString}`, { 
              method: "GET",
              headers: {
                  "Content-Type": "application/json",
              }
              }).then(async (res: any) => {
                  let data = await res.json();
                  let currentResources = data.currentResource;
                  // kiểm tra xem nhân viên đó còn thời gian làm việc trong 1 ngày không
                  if (currentResources.length > 0) {
                    for (var i = 0; i < currentResources.length; i++) {
                      let currentResource = currentResources[i];
                      if ((Number(dataMaster) - Number(currentResource.planEffort)) < Number(target.planEffort)) {
                        toast.error("Employee Effort đã quá thời gian làm!");
                        return;
                      }
                    }
                    
                    fetch("/api/project/resource-allocation/edit", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                          id: target.id,
                          employeeId: target.employeeId,
                          position: target.position,
                          planEffort: target.planEffort,
                          startDate: startDate,
                          endDate: endDate,
                          mm: target.mm,
                          description: target.description
                      }),
                    }).then(async (res) => {
                      if (res.status === 200) {
                        changeProjectOptionSearch(projectId);
                        setCurrentIndex(-1);
                        toast.success("Update project information successfully.");

                        const queryString = objToQueryString({
                          resourceAllocationId: target.id
                        });
                        fetch(`/api/currentresource/delete?${queryString}`, { 
                          method: "GET",
                          headers: {
                              "Content-Type": "application/json",
                          }
                          }).then(async (res: any) => {
                            if (res.status === 200) {
                              for (let currentDate = new Date(target.startDate); currentDate <= target.endDate; currentDate.setDate(currentDate.getDate() + 1)) {
                                let newDate = moment.utc(currentDate).tz("Asia/Ho_Chi_Minh").format().replace("+07:00", "Z");
                                let checkDateAdd: Number = currentDate.getDay();
                                if (checkDateAdd != 0 && checkDateAdd != 6) {
                                  let remainEffort = Number(dataMaster) - target.planEffort;
                                  fetch("/api/currentresource/add", {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        employeeId: target.employeeId,
                                        resource_allocation_id: target.id,
                                        planEffort: target.planEffort,
                                        date: newDate,
                                        remainEffort: remainEffort,
                                        description: target.description,
                                    }),
                                  }).then(async (res) => {
                                    setLoading(false);
                                    if (res.status === 200) {
                                    } else {
                                      toast.error(await res.text());
                                    }
                                  });
                                }
                              }
                            }
                            
                          })
                      } else {
                        toast.error(await res.text());
                        setResourceAllocation(target);
                      }
                    });

                  } else {
                    fetch("/api/project/resource-allocation/edit", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id: target.id,
                        employeeId: target.employeeId,
                        position: target.position,
                        planEffort: target.planEffort,
                        startDate: startDate,
                        endDate: endDate,
                        mm: target.mm,
                        description: target.description
                    }),
                  }).then(async (res) => {
                    if (res.status === 200) {
                      changeProjectOptionSearch(projectId);
                      setCurrentIndex(-1);
                      toast.success("Update project information successfully.");

                      for (let currentDate = new Date(target.startDate); currentDate <= target.endDate; currentDate.setDate(currentDate.getDate() + 1)) {
                        let newDate = moment.utc(currentDate).tz("Asia/Ho_Chi_Minh").format().replace("+07:00", "Z");
                        let remainEffort = Number(dataMaster) - target.planEffort;
                        let checkDateAdd: Number = currentDate.getDay();
                        if (checkDateAdd != 0 && checkDateAdd != 6) {
                          fetch("/api/currentresource/add", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                employeeId: target.employeeId,
                                planEffort: target.planEffort,
                                date: newDate,
                                remainEffort: remainEffort,
                                description: target.description,
                            }),
                          }).then(async (res) => {
                            setLoading(false);
                            if (res.status === 200) {
                            } else {
                              toast.error(await res.text());
                            }
                          });
                        }
                      }
                    } else {
                      toast.error(await res.text());
                      setResourceAllocation(target);
                    }
                  });
                  }
              })
              },
              validationSchema: yup.object({
                planEffort: yup.string().trim().required('Required'),
                mm: yup.string().trim().required('Required'),
              }),
    });

    const changeStartDate = (event: any) => {
        let startDate = event.target.value;
        formikAdd.setFieldValue('startDate', startDate);
        checkNull(startDate, formikAdd.values.endDate, formikAdd.values.planEffort);
    }

    const changeEndDate = (event: any) => {
        let endDate = event.target.value;
        formikAdd.setFieldValue('endDate', endDate);
        checkNull(formikAdd.values.startDate, endDate, formikAdd.values.planEffort);
        
    }

    const changePlanEffort = (event: any) => {
        let planEffort = event.target.value;
        formikAdd.setFieldValue('planEffort', planEffort);
        checkNull(formikAdd.values.startDate, formikAdd.values.endDate, planEffort);
    }

    function checkNull(number1: any, number2: any, number3: any) {
        
        if (number1 != null && number2 != null && number3 != null && number3.trim().length > 0) {
            countWeekendDays(number1, number2, number3);
        }
    }

    /**
     * The function calculates the number of weekend days between two dates and uses that information
     * to calculate a value called "mm" which is then set as a field value in a formik form.
     * @param {Date} startDate - The start date of the project.
     * @param {Date} endDate - The `endDate` parameter is the date representing the end of the time
     * period for which you want to count the number of weekend days.
     * @param {number} planEffort - The planEffort parameter represents the total effort or work hours
     * required for a project or task.
     */
    function countWeekendDays(startDate: Date, endDate: Date, planEffort: number) {
        const countMonths = calculateMonthDifference(startDate, endDate);
        if (countMonths >= 2) {
          let mmstart = generateCurrentMM(startDate, planEffort, false);
          let mmEnd = generateCurrentMM(endDate, planEffort, true);

          const startYear = startDate.getFullYear();
          const endYear = endDate.getFullYear();
          let mmTwoMonth = 0;
          if (startYear === endYear) {
            let newStartMonth = startDate.getMonth() + 1;
            let newEndMonth = endDate.getMonth() - 1;
            for (let i = newStartMonth; i <= newEndMonth; i++) {
              mmTwoMonth += (planEffort / 8);
            } 
          } else if (startYear < endYear) {
            mmTwoMonth = calculateMonthDifference(startDate,endDate);
            mmTwoMonth = mmTwoMonth - 2;
          } else {
            toast.error('nam start phai nho hon nam end');
          }
          let mm = mmstart + mmTwoMonth + mmEnd;
          let mmMath = Math.round(mm * 1000) / 1000;
          formikAdd.setFieldValue('mm', mmMath);
        } else if (countMonths >= 1){
          let mmstart = generateCurrentMM(startDate, planEffort, false);
          let mmEnd = generateCurrentMM(endDate, planEffort, true);
          let mm = mmstart + mmEnd;
          let mmMath = Math.round(mm * 1000) / 1000;
          formikAdd.setFieldValue('mm', mmMath);
        } else {
          const daysInMonth = getDaysInMonth(startDate.getFullYear(), startDate.getMonth() + 1);
          const countSunSetInOneMonth = counSatSuntWeekendDays(startDate.getFullYear(), startDate.getMonth() + 1);
          const currentDays = daysInMonth - (countSunSetInOneMonth.saturday + countSunSetInOneMonth.sunday);

          const countDayOff = countWeekendDaysInRange(startDate, endDate);

          const startUTC = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0,0);
          const endUTC = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59);
          const timeDifference = endUTC - startUTC;
          const dayDifference = Math.round(timeDifference / (1000 * 60 * 60 * 24));
          const dayOnl = dayDifference - countDayOff;
          let mm = (planEffort / 8)*(dayOnl / currentDays);
          let mmMath = Math.round(mm * 1000) / 1000;
          formikAdd.setFieldValue('mm', mmMath);
        }
    }
    
    function generateCurrentMM(sDate: Date,planEffort: number, isLast: boolean) {
        if (isLast) {
          const endDate = sDate;
          const startDate = new Date(endDate);
    
          const daysInMonth = getDaysInMonth(startDate.getFullYear(), startDate.getMonth() + 1);
          const countSunSetInOneMonth = counSatSuntWeekendDays(startDate.getFullYear(), startDate.getMonth() + 1);
          const currentDays = daysInMonth - (countSunSetInOneMonth.saturday + countSunSetInOneMonth.sunday);
          // Đặt ngày là 1 để lấy ngày đầu tiên của tháng
          startDate.setDate(1);
          const countDayOff = countWeekendDaysInRange(startDate, endDate);

          const startUTC = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0,0);
          const endUTC = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59);
          const timeDifference = endUTC - startUTC;
          const dayDifference = Math.round(timeDifference / (1000 * 60 * 60 * 24));
          const dayOnl = dayDifference - countDayOff;
          let mm = (planEffort / 8)*(dayOnl / currentDays);
          return mm;
        } else {
          const startDate = sDate;
          const endDate = new Date(startDate);
          // Đặt ngày là 1 để chuyển sang tháng tiếp theo
          endDate.setDate(1);
          // Trừ đi 1 ngày để lấy ngày cuối cùng của tháng
          endDate.setMonth(endDate.getMonth() + 1);
          endDate.setDate(endDate.getDate() - 1);

          const daysInMonth = getDaysInMonth(startDate.getFullYear(), startDate.getMonth() + 1);
          const countSunSetInOneMonth = counSatSuntWeekendDays(startDate.getFullYear(), startDate.getMonth() + 1);

          const currentDays = daysInMonth - (countSunSetInOneMonth.saturday + countSunSetInOneMonth.sunday);

          const countDayOff = countWeekendDaysInRange(startDate, endDate);
          const startUTC = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0);
          const endUTC = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59);
          const timeDifference = endUTC - startUTC;
          const dayDifference = Math.round(timeDifference / (1000 * 60 * 60 * 24));
          const dayOnl = dayDifference - countDayOff;
          let mm = (planEffort / 8)*(dayOnl / currentDays);
          return mm;
      }
    }

    function getDaysInMonth(year: any, month: any) {
      return new Date(year, month, 0).getDate();
    }

    function counSatSuntWeekendDays(year: any, month: any) {
      // Tạo đối tượng Date với ngày đầu tiên của tháng
      const startDate = new Date(year, month - 1, 1);
      // Tạo đối tượng Date với ngày cuối cùng của tháng
      const endDate = new Date(year, month, 0);
      let saturdayCount = 0;
      let sundayCount = 0;
      
      // Lặp qua từng ngày trong khoảng từ ngày đầu tiên đến ngày cuối cùng của tháng
      for (let currentDate = startDate; currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
        // 0 là Chủ nhật, 6 là Thứ bảy trong đối tượng Date
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek === 0) {
          sundayCount++;
        } else if (dayOfWeek === 6) {
          saturdayCount++;
        }
      }
      
      return {
        saturday: saturdayCount,
        sunday: sundayCount,
      };
    }

    

    function calculateMonthDifference(startDate: Date, endDate: Date) {
      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth();
      
      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth();
      
      const yearDifference = endYear - startYear;
      const monthDifference = endMonth - startMonth;
      
      const totalMonths = yearDifference * 12 + monthDifference;
      
      return totalMonths;
    }

    function countWeekendDaysInRange(startDate: Date, endDate: Date) {
      let saturdayCount = 0;
      let sundayCount = 0;
      // Lặp qua từng ngày trong khoảng thời gian
      for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek === 0) {
          sundayCount++;
        } else if (dayOfWeek === 6) {
          saturdayCount++;
        }
      }

      let countSunSet = saturdayCount + sundayCount;
      return countSunSet;
    }

    const changeStartDateUpdate = (event: any) => {
      let startDate = event.target.value;
      formikUpdate.setFieldValue('startDate', startDate);
      checkNullUpdate(startDate, formikUpdate.values.endDate, formikUpdate.values.planEffort);
    }

    const changeEndDateUpdate = (event: any) => {
      let endDate = event.target.value;
      formikUpdate.setFieldValue('endDate', endDate);
      checkNullUpdate(formikUpdate.values.startDate, endDate, formikUpdate.values.planEffort);
        
    }

    const changePlanEffortUpdate = (event: any) => {
      let planEffort = event.target.value;
      formikUpdate.setFieldValue('planEffort', planEffort);
      checkNullUpdate(formikUpdate.values.startDate, formikUpdate.values.endDate, planEffort);
    }

    function checkNullUpdate(number1: any, number2: any, number3: any) {
        
      if (number1 != null && number2 != null && number3 != null && number3.trim().length > 0) {
        countWeekendDaysUpdate(number1, number2, number3);
      }
    }

    function countWeekendDaysUpdate(startDate: Date, endDate: Date, planEffort: number) {
      const countMonths = calculateMonthDifference(startDate, endDate);
        if (countMonths >= 2) {
          let mmstart = generateCurrentMM(startDate, planEffort, false);
          let mmEnd = generateCurrentMM(endDate, planEffort, true);

          const startYear = startDate.getFullYear();
          const endYear = endDate.getFullYear();
          let mmTwoMonth = 0;
          if (startYear === endYear) {
            let newStartMonth = startDate.getMonth() + 1;
            let newEndMonth = endDate.getMonth() - 1;
            for (let i = newStartMonth; i <= newEndMonth; i++) {
              mmTwoMonth += (planEffort / 8);
            } 
          } else if (startYear < endYear) {
            mmTwoMonth = calculateMonthDifference(startDate,endDate);
            mmTwoMonth = mmTwoMonth - 2;
          } else {
            toast.error('nam start phai nho hon nam end');
          }
          let mm = mmstart + mmTwoMonth + mmEnd;
          let mmMath = Math.round(mm * 1000) / 1000;
          formikUpdate.setFieldValue('mm', mmMath);
        } else if (countMonths >= 1){
          let mmstart = generateCurrentMM(startDate, planEffort, false);
          let mmEnd = generateCurrentMM(endDate, planEffort, true);
          let mm = mmstart + mmEnd;
          let mmMath = Math.round(mm * 1000) / 1000;
          formikUpdate.setFieldValue('mm', mmMath);
        } else {
          const daysInMonth = getDaysInMonth(startDate.getFullYear(), startDate.getMonth() + 1);
          const countSunSetInOneMonth = counSatSuntWeekendDays(startDate.getFullYear(), startDate.getMonth() + 1);
          const currentDays = daysInMonth - (countSunSetInOneMonth.saturday + countSunSetInOneMonth.sunday);

          const countDayOff = countWeekendDaysInRange(startDate, endDate);

          const startUTC = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0,0);
          const endUTC = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59);
          const timeDifference = endUTC - startUTC;
          const dayDifference = Math.round(timeDifference / (1000 * 60 * 60 * 24));
          const dayOnl = dayDifference - countDayOff;
          let mm = (planEffort / 8)*(dayOnl / currentDays);
          let mmMath = Math.round(mm * 1000) / 1000;
          formikUpdate.setFieldValue('mm', mmMath);
        }
    }

    const changeTypeSearch = async (type: any) => {
      if (type == 1) {
        setTypeSearch(2);
      } else {
        setTypeSearch(1);
      }
    }

    $('#refdocs_list ul li').click(function () {
      setHiddenProjectsSearch(true);
      $('#refdocs').val($(this).text());
      changeProjectOptionSearch($(this).val());
    });

    $('#refdocs_list_employee ul li').click(function () {
      setHiddenEmployeeSearch(true);
      let dataFilter = resourceAllocationsFilter;
      $('#refdocs_employee').val($(this).text());
      if ($(this).text().trim() != 'All') {
        dataFilter = resourceAllocationsFilter?.filter((item: any) => 
        item?.name == $(this).text());
        setResourceAllocations(dataFilter);
      } else {
        setResourceAllocations(resourceAllocationsFilter);
      }
    });

    const convertNumberToLocalString = (number: any) => {
      let result = Number.parseFloat(number).toFixed(3);
      return result;
    }

    return (
        <>
        <div className={``}>
        <div className="text-lg flex items-center gap-x-4 cursor-pointer rounded-md">
          <span className='text-3xl block float-left'><GoProject /></span>
          <h1>Resource Allocation</h1>
        </div>

        <hr className="border-1 border-gray-500 drop-shadow-xl mt-1 mb-2" />
        
        <div className='flex justify-between xl:w-full'>
            <div className='flex justify-center'>
              <div className='inline-flex w-[250px]'>
                <div className={`relative w-full inline-flex rounded-md items-stretch shrink-0 grow-0 ${(typeSearch == 2) && "hidden"}`}>
                  <div className="absolute inset-y-0 left-0 flex items-center px-2 z-50" onClick={() => changeTypeSearch(1)}>
                    <MdNotes className='text-xl'/>
                  </div>
                  <div className="relative w-full inline-flex rounded-md items-stretch shrink-0 grow-0">
                    <input type='text' id='refdocs' className={`w-full appearance-none py-1.5 px-3 pl-8 bg-white 
                      border border-gray-300 hover:border-light-blue focus:border-light-blue focus:outline-none 
                      text-base focus:z-10 rounded-md `} onKeyUp={searchProject}/>
                  </div>
                  
                  <div id="refdocs_wrapper" className={`absolute top-[40px] left-0 w-[250px] ${(hiddenProjectsSearch == true) && "hidden"}`}>
                    <div id="refdocs_list" className='w-full appearance-none py-1.5 px-3 pl-8 bg-white 
                    border border-gray-300 hover:border-light-blue focus:border-light-blue focus:outline-none 
                    text-base focus:z-10 rounded-md'>
                        <ul>
                          {
                          projects != null && projects.length > 0 ? (
                              projects.map((project: any, index) => {
                                  return (
                                  <li key={"project-" + index} value={project.id}>{project.name}</li>
                                  )
                              })
                          ) : (<></>)
                          }
                        </ul>
                    </div>
                  </div>
                </div>

                <div className={`relative w-full inline-flex rounded-md items-stretch shrink-0 grow-0 ${(typeSearch == 1) && "hidden"}`}>
                  <div className="absolute inset-y-0 left-0 flex items-center px-2 z-50" onClick={() => changeTypeSearch(2)}>
                    <MdNotes className='text-xl' />
                  </div>
                  <select id="work-type" className={`w-full appearance-none py-1.5 px-3 pl-8 bg-white 
                    border border-gray-300 hover:border-light-blue focus:border-light-blue focus:outline-none 
                    text-base focus:z-10 rounded-md `} onChange={changeProject}>
                    {
                        projects != null && projects.length > 0 ? (
                            projects.map((project: any, index) => {
                                return (
                                <option key={"project-" + index} value={project.id} selected={stateProject.id == project.id}>{project.name}</option>
                                )
                            })
                        ) : (<></>)
                    }

                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 z-50">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className='w-[250px] flex-none relative ml-2'>
                <div className={`relative w-full inline-flex rounded-md items-stretch shrink-0 grow-0`}>
                    { 
                      session?.data?.user?.role !== "MANAGER" ? 
                      <div className="relative w-full inline-flex rounded-md items-stretch shrink-0 grow-0">
                        <input type='text' id='refdocs_employee' className={`w-full appearance-none py-1.5 px-3 pl-8 bg-white 
                          border border-gray-300 hover:border-light-blue focus:border-light-blue focus:outline-none 
                          text-base focus:z-10 rounded-md `} placeholder='Search Employee' onKeyUp={searchProjectEmployee}/>
                      </div> : <></>
                    }
                    
                    
                    <div id="refdocs_wrapper_employee" className={`absolute top-[40px] left-0 w-[250px] ${(hiddenEmployeeSearch == true) && "hidden"}`}>
                      <div id="refdocs_list_employee" className='w-full appearance-none py-1.5 px-3 pl-8 bg-white 
                      border border-gray-300 hover:border-light-blue focus:border-light-blue focus:outline-none 
                      text-base focus:z-10 rounded-md'>
                          <ul>
                          <li key={"all"} value='all'>All</li>
                            {
                            resourceAllocations != null && resourceAllocations.length > 0 ? (
                              resourceAllocations.map((resourceAllocation: any, index) => {
                                    return (
                                    <li key={"resourceAllocation-" + index} value={resourceAllocation.id}>{resourceAllocation.name}</li>
                                    )
                                })
                            ) : (<></>)
                            }
                          </ul>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
            <div>
                <button className={`ml-2 inline-flex items-center px-5 py-2 text-white text-sm font-medium rounded-md 
                ${isResourceAllocationRequest ? "bg-gray-600 hover:bg-gray-500" : "bg-dark-blue hover:bg-indigo-600"} `}  
                type="button"
                onClick={() => { formikAdd.setValues(initialEmployees); setResourceAllocationRequest(!isResourceAllocationRequest)}}>
                {
                    (isResourceAllocationRequest) ? (
                    <>
                        <MdCancel/>&nbsp; Cancel
                    </>
                    ) : (
                    <>
                        <BsPlusCircleFill />&nbsp; Add Employee
                    </>
                    )
                }
                </button>
            </div>
        </div>
        <div className="mx-auto mt-2" id="search-area">
          <div className="flex flex-col">
            <div className="overflow-x-auto rounded-t-lg test-height">
              <div className="inline-block w-full align-middle">
                <div className="overflow-hidden ">
                    <div className={`${(isResourceAllocationRequest) ? "block" : "hidden"} mt-3 mb-5`}>
                        <form className={``} onSubmit={formikAdd.handleSubmit}>
                          <div className="flex relative">
                              <span className="input-label px-4 inline-flex items-center border border-r-0 border-gray-200 
                              bg-gray-50 text-gray-500">
                              Employee
                              </span>
                              <div className="w-full relative">
                                  <select id="employeeId" className="appearance-none py-1 px-3 pr-11 block w-full border 
                                      border-gray-200 focus:z-10 focus:border-gray-300 focus:outline-none" 
                                      name="employeeId"
                                      onChange={formikAdd.handleChange}
                                      onBlur={formikAdd.handleBlur}
                                      value={formikAdd.values.employeeId} >
                                      {
                                          employees != null && employees.length > 0 ? (
                                              employees.map((employee: any, index) => {
                                                  return (
                                                  <option key={"employee-" + index} value={employee.id}>{employee.name}</option>
                                                  )
                                              })
                                          ) : (<></>)
                                      }
                                  </select>
                              </div>

                              <span className="input-label px-4 inline-flex items-center border border-r-0 border-gray-200 
                              bg-gray-50 text-gray-500">
                              Role
                              </span>
                              <div className="w-full relative">
                                  <select id="position" className="appearance-none py-1 px-3 pr-11 block w-full border 
                                      border-gray-200 focus:z-10 focus:border-gray-300 focus:outline-none" 
                                      name="position"
                                      onChange={formikAdd.handleChange}
                                      onBlur={formikAdd.handleBlur}
                                      value={formikAdd.values.position} >
                                      <option value="INTERN">Intern</option>
                                      <option value="DESIGNER">Designer</option>
                                      <option value="DEVELOPER">Developer</option>
                                      <option value="TESTER">Tester</option>
                                      <option value="TEST_LEADER">Test Leader</option>
                                      <option value="QA">QA</option>
                                      <option value="QA_LEAD">QA Leader</option>
                                      <option value="COMTOR">Comtor</option>
                                      <option value="TEAM_LEADER">Team Leader</option>
                                      <option value="PROJECT_TECHNICAL_LEADER">Technical Leader</option>
                                      <option value="BRSE">BRSE</option>
                                      <option value="PROJECT_MANAGER">Project Manager</option>
                                      <option value="RECEPTION">Reception</option>
                                      <option value="SALES">Sales</option>
                                      <option value="FREELANCER">Freelancer</option>
                                      <option value="HR">HR</option>
                                      <option value="HR_LEADER">HR Leader</option>
                                      <option value="ACCOUNTANT">Accountant</option>
                                      <option value="DEPARTMENT_MANAGER">Department Manager</option>
                                      <option value="CTO">CTO</option>
                                      <option value="COO">COO</option>
                                      <option value="CEO">CEO</option>
                                  </select>
                              </div>
                          </div>

                          <div className="flex relative">
                              <span className="input-label px-4 inline-flex items-center border border-r-0 border-gray-200 
                              bg-gray-50 text-gray-500">
                              Start Date
                              </span>
                              <div className="w-full relative">
                              <Calendar
                                  id="deadline" 
                                  className={`group-calendar-picker group-cell-calendar-picker border border-gray-200`}
                                  dateFormat="yy-mm-dd"
                                  name='startDate'
                                  value={formikAdd.values.startDate}
                                  onChange={changeStartDate}
                              />
                              </div>

                              <span className="input-label px-4 inline-flex items-center border border-r-0 border-gray-200 
                              bg-gray-50 text-gray-500">
                              End Date
                              </span>
                              <div className="w-full relative">
                              <Calendar
                                  id="deadline" 
                                  className={`group-calendar-picker group-cell-calendar-picker border border-gray-200`}
                                  dateFormat="yy-mm-dd"
                                  name='endDate'
                                  value={formikAdd.values.endDate}
                                  onChange={changeEndDate}
                              />
                              </div>
                          </div>

                        
                          <div className="flex relative">
                              <span className="input-label px-4 inline-flex items-center border border-r-0 border-gray-200 
                              bg-gray-50 text-gray-500">
                                  Planned (h)
                              </span>
                              
                              <div className="w-full relative">
                                  <input type="text" className={`py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 
                                  focus:z-10 focus:border-gray-300 focus:outline-none
                                  ${formikAdd.errors.planEffort && "error-validate"}`}
                                  name="planEffort"
                                  onChange={changePlanEffort}
                                  onBlur={formikAdd.handleBlur}
                                  value={formikAdd.values.planEffort}  
                                  placeholder={formikAdd.errors.planEffort && formikAdd.errors.planEffort} />
                              </div>

                              <span className="input-label px-4 inline-flex items-center border border-r-0 border-gray-200 
                              bg-gray-50 text-gray-500">
                                  MM
                              </span>
                              
                              <div className="w-full relative">
                                  <span className={`py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 
                                  focus:z-10 focus:border-gray-300 focus:outline-none`}>
                                    {formikAdd.values.mm} &nbsp;
                                  </span>
                                  {/* <input type="text" className={`py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 
                                  focus:z-10 focus:border-gray-300 focus:outline-none
                                  ${formikAdd.errors.mm && "error-validate"}`}
                                  name="mm"
                                  value={formikAdd.values.mm}
                                  onChange={formikAdd.handleChange}
                                  onBlur={formikAdd.handleBlur} 
                                  placeholder={formikAdd.errors.mm && formikAdd.errors.mm} /> */}
                              </div>
                          </div>

                          <div className="flex relative">
                              <span className="input-label px-4 inline-flex items-center border border-r-0 border-gray-200 
                              bg-gray-50 text-gray-500">
                                  Note
                              </span>
                              
                              <div className="w-full relative">
                                  <textarea className={`py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 
                                  focus:z-10 focus:border-gray-300 focus:outline-none
                                  ${formikAdd.errors.description && "error-validate"}`}
                                  name="description"
                                  onChange={formikAdd.handleChange}
                                  onBlur={formikAdd.handleBlur}
                                  value={formikAdd.values.description} 
                                  placeholder={formikAdd.errors.description && formikAdd.errors.description} />
                              </div>
                          </div>
                          <div>
                              <button className="m-0 w-full items-center py-1 bg-green-600 hover:bg-green-500 
                              text-center text-white text-sm font-medium" type="submit">
                              <FiSend className='inline-block' />&nbsp;
                                  Add
                              </button>
                          </div>
                        </form>
                    </div>
                    
                  
                    <form className="" onSubmit={formikUpdate.handleSubmit}>
                    <table className="w-full divide-y divide-gray-200">
                      <thead className="bg-light-blue">
                        <tr>
                          <th scope="col" className="w-[33px] p-2 border border-gray-300 text-center">
                            <div className="flex items-center">
                              <input id="checkbox-all" type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                              <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                            </div>
                          </th>
                          <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            User
                          </th>
                          <th scope="col" className="w-[90px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Role
                          </th>
                          <th scope="col" className="w-[120px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Planned (h)
                          </th>
                          <th scope="col" className="w-[90px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Start Date
                          </th>
                          <th scope="col" className="w-[90px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            End Date
                          </th>
                          <th scope="col" className="w-[60px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            MM
                          </th>
                          <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Note
                          </th>
                          <th scope="col" className="w-[80px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody className="bg-white">
                        {
                          resourceAllocations != null && resourceAllocations.length > 0 ? (
                            resourceAllocations.map((resourceAllocation: any, index) => {
                              
                              return (
                                <tr className="hover:bg-gray-100" key={"project-" + index}>
                                  <td className="p-2 border border-gray-300 text-center">
                                    <div className="flex items-center">
                                      <input id="checkbox-table-1" type="checkbox" className="w-4 h-4 rounded 
                                        border-gray-300" />
                                      <label htmlFor="checkbox-table-1" className="sr-only">checkbox</label>
                                      <input type="hidden" name="id" value={resourceAllocation.id} onChange={formikUpdate.handleChange}/>
                                    </div>
                                  </td>
  
                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`}>
                                    <span className={` ${(index == currentIndex)}`}>{resourceAllocation.name}</span>
                                  </td>
  
                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`}>
                                    <span className={` ${(index == currentIndex) && "hidden"}`}>{resourceAllocation.position}</span>
                                    <select id="position" className={` ${(index != currentIndex) && "hidden"} 
                                      py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 
                                      focus:border-gray-300 focus:outline-none bg-table-input`} 
                                      name="position"
                                      value={formikUpdate.values.position}
                                      onChange={formikUpdate.handleChange}
                                      onBlur={formikUpdate.handleBlur}>
                                      <option value="INTERN">Intern</option>
                                      <option value="DESIGNER">Designer</option>
                                      <option value="DEVELOPER">Developer</option>
                                      <option value="TESTER">Tester</option>
                                      <option value="TEST_LEADER">Test Leader</option>
                                      <option value="QA">QA</option>
                                      <option value="QA_LEAD">QA Leader</option>
                                      <option value="COMTOR">Comtor</option>
                                      <option value="TEAM_LEADER">Team Leader</option>
                                      <option value="PROJECT_TECHNICAL_LEADER">Technical Leader</option>
                                      <option value="BRSE">BRSE</option>
                                      <option value="PROJECT_MANAGER">Project Manager</option>
                                      <option value="RECEPTION">Reception</option>
                                      <option value="SALES">Sales</option>
                                      <option value="FREELANCER">Freelancer</option>
                                      <option value="HR">HR</option>
                                      <option value="HR_LEADER">HR Leader</option>
                                      <option value="ACCOUNTANT">Accountant</option>
                                      <option value="DEPARTMENT_MANAGER">Department Manager</option>
                                      <option value="CTO">CTO</option>
                                      <option value="COO">COO</option>
                                      <option value="CEO">CEO</option>
                                    </select>
                                  </td>

                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300 text-right`}>
                                    <span className={` ${(index == currentIndex) && "hidden"}`}>{resourceAllocation.planEffort}</span>
                                    <input type="text" className={` ${(index != currentIndex) && "hidden"} 
                                      py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 
                                      focus:border-gray-300 focus:outline-none bg-table-input 
                                      ${formikUpdate.errors.planEffort && "error-validate"}`} 
                                      name="planEffort"
                                      value={formikUpdate.values.planEffort}
                                      onChange={changePlanEffortUpdate}
                                      onBlur={formikUpdate.handleBlur} 
                                      placeholder={formikUpdate.errors.planEffort && formikUpdate.errors.planEffort}  />
                                  </td>

                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`}>
                                    <span className={` ${(index == currentIndex) ? "hidden" : "block"} w-full text-center`}>
                                      {resourceAllocation.startDate}
                                    </span>
                                    <Calendar
                                      id="startDate" 
                                      className={` calendar-picker cell-calendar-picker bg-table-input`}
                                      dateFormat="yy-mm-dd"
                                      name='startDate'
                                      value={formikUpdate.values.startDate}
                                      onChange={changeStartDateUpdate}
                                      style={(index != currentIndex) ? {display: "none"} : {}}
                                    />
                                  </td>

                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`}>
                                    <span className={` ${(index == currentIndex) ? "hidden" : "block"} w-full text-center`}>
                                      {resourceAllocation.endDate}
                                    </span>
                                    <Calendar
                                      id="endDate" 
                                      className={` calendar-picker cell-calendar-picker bg-table-input`}
                                      dateFormat="yy-mm-dd"
                                      name='endDate'
                                      value={formikUpdate.values.endDate}
                                      onChange={changeEndDateUpdate}
                                      style={(index != currentIndex) ? {display: "none"} : {}}
                                    />
                                  </td>
  
                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300 text-right`}>
                                    <span className={` ${(index == currentIndex) && "hidden"}`}>{convertNumberToLocalString(resourceAllocation.mm)}</span>
                                    <input type="number" className={` ${(index != currentIndex) && "hidden"} 
                                      py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 
                                      focus:border-gray-300 focus:outline-none
                                      ${formikUpdate.errors.mm && "error-validate"}`} 
                                      name="mm"
                                      value={formikUpdate.values.mm}
                                      placeholder={formikUpdate.errors.mm && formikUpdate.errors.mm}  disabled/>
                                  </td>

                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`}>
                                    <span className={` ${(index == currentIndex) && "hidden"}`}>{resourceAllocation.description}</span>
                                    <input type="text" className={` ${(index != currentIndex) && "hidden"} 
                                      py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 
                                      focus:border-gray-300 focus:outline-none bg-table-input`} 
                                      name="description"
                                      value={formikUpdate.values.description}
                                      onChange={formikUpdate.handleChange}
                                      onBlur={formikUpdate.handleBlur} />
                                  </td>
  
                                  <td className="p-2 text-sm font-normal text-center border border-gray-300">
                                    {
                                      index == currentIndex ? (
                                        <>
                                          <a href="#" className="text-base text-blue-600 hover:underline mr-1"  style={{marginLeft: "margin-left: 0.75rem;"}}
                                            onClick={() => { 
                                              $('#btn-update-resource-allocation').click(); 
                                              return false;
                                            } } >
                                              <FaSave />
                                          </a>
                                          <button id="btn-update-resource-allocation" className="hidden items-center px-3 
                                            py-2 bg-gray-400 hover:bg-gray-600 text-white text-sm font-medium 
                                            rounded-md" type="submit">
                                            <FaSave />
                                          </button>
                                          <a href="#" className="text-base text-red-600 hover:underline" 
                                            onClick={() => {
                                              setCurrentIndex(-1);
                                            }}>
                                            <MdCancel />
                                          </a>
                                        </>
                                      ) : (
                                        <>
                                          <a href="#" className="text-base text-blue-600 hover:underline float-left mr-1" 
                                            onClick={() => {
                                              setResourceAllocation({
                                                id: resourceAllocation.id,
                                                employeeId: resourceAllocation.employeeId,
                                                position: resourceAllocation.position,
                                                planEffort: resourceAllocation.planEffort,
                                                startDate: moment(resourceAllocation.startDate, "YYYY-MM-DD").toDate(),
                                                endDate: moment(resourceAllocation.endDate, "YYYY-MM-DD").toDate(),
                                                mm: resourceAllocation.mm,
                                                description: resourceAllocation.description,
                                              });
                                              formikUpdate.setValues({
                                                id: resourceAllocation.id,
                                                employeeId: resourceAllocation.employeeId,
                                                position: resourceAllocation.position,
                                                planEffort: resourceAllocation.planEffort,
                                                startDate: moment(resourceAllocation.startDate, "YYYY-MM-DD").toDate(),
                                                endDate: moment(resourceAllocation.endDate, "YYYY-MM-DD").toDate(),
                                                mm: resourceAllocation.mm,
                                                description: resourceAllocation.description,
                                              })
                                              setCurrentIndex(index);
                                              setPantEffortEdit(resourceAllocation.planEffort);
                                            }}>
                                              <RiFileEditFill />
                                          </a>
                                          <a href="#" className="text-base text-red-600 hover:underline float-left mr-1" 
                                            onClick={() => { confirmResourceAllocation(resourceAllocation.id) }}>
                                            <RiDeleteBin2Fill />
                                          </a>
                                          <a href="#" className="text-base text-green-600 hover:underline" 
                                            onClick={() => {  }}>
                                            <FaInfoCircle />
                                          </a>
                                        </>
                                      )
                                    }
                                  </td>
                                </tr>
                              )
                            })
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
                  </form>
                  
                  <div id="pagination">
                    <Pagination
                        activePage={page}
                        totalItemsCount={total}
                        itemsCountPerPage={maxResults}
                        onChange={e => handlePagination(e)}
                        activeClass="active"
                        itemClass="pagelinks"
                        prevPageText="Trước"
                        nextPageText="Sau"
                        firstPageText="Đầu"
                        lastPageText="Cuối"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
    </div>
    </>
    )
}