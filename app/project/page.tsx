"use client"

import React, { useEffect, useState,useContext } from 'react'
import Modal from 'react-modal';

import $ from "jquery"
import { useFormik } from 'formik';
import * as yup from 'yup';

import Pagination from "react-js-pagination";

import moment from "moment-timezone";

import LoadingDots from "@/components/loading-dots";

import toast from "react-hot-toast";

import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

import { FaInfoCircle, FaShareSquare } from "react-icons/fa"
import { FiSearch } from "react-icons/fi"
import { MdOutlineClear, MdCancel } from "react-icons/md"
import { RiFileEditFill, RiDeleteBin2Fill } from "react-icons/ri"
import { BsPlusCircleFill } from "react-icons/bs"
import { AiFillForward, AiFillSave } from "react-icons/ai"
import { FaSave } from "react-icons/fa"
import { GoProject } from "react-icons/go"

import ConfirmBox from "../../components/confirm"

import "primereact/resources/themes/lara-light-indigo/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";                                //icons

import { Calendar } from 'primereact/calendar';
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { useSession } from 'next-auth/react';

export default function Project() {

  const session : any = useSession()

  const stateSetProject = useAppStore(state => state.setProject);
  const router = useRouter();

  useEffect(() => {
    Modal.setAppElement('#modals');
  }, []);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  const [maxResults, setMaxResults] = useState(10);
  const [billableEffort, setBillableEffort] = useState(Number);
  const [currencyMap, setCurrencyMap] = useState(new Map());
  const [currencyDefault, setCurrencyDefault] = useState(null);

  const handlePagination = async (page:any) => {
    setPage(page);
  }


  const [isOpen, setIsOpen] = React.useState(false)
  const customModalStyles = {
      overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)'
      },
      content: {
        width: '520px',
        overflow: 'hidden',
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
      }
  }

  const [isOpenDetail, setIsOpenDetail] = React.useState(false)
  const customModalDetalStyles = {
      overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)'
      },
      content: {
        width: '750px',
        overflow: 'hidden',
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
      }
  }
  const [resourceAllocations, setResourceAllocations] = useState([]);
  const [pageResourceAllocation, setPageResourceAllocation] = useState(1);

  const getProjectDetail = async (projectId: any) => {
    const queryStringResourceAllocation = objToQueryString({
      projectId: projectId,
      page: pageResourceAllocation,
      maxResult: 1000,
    });
    fetch(`/api/project/resource-allocation/list?${queryStringResourceAllocation}`, { 
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(async (res: any) => {
      let data = await res.json();
      let bEffort = 0;
      for(var i = 0; i < data.resourceAllocations.length; i++) {
        let result = data.resourceAllocations[i];
        bEffort += result.mm * result.salary;
      }
      setBillableEffort(bEffort);
      setResourceAllocations(data.resourceAllocations);
    });
    setIsOpenDetail(true);
  }

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const formikAdd = useFormik({
    initialValues: {
      name: '',
      code: '',
      customerId: '',
      departmentId: '',
      startDate: '',
      endDate: '',
      projectManagerId: '',
      cost: '',
      costBudget: '',
      status: '',
      currency: '',
      description: '',
    },
    onSubmit: (target: any) => {
      let startDate = moment.utc(target.startDate).tz("Asia/Ho_Chi_Minh").format().replace("+07:00", "Z");
      let endDate = moment.utc(target.endDate).tz("Asia/Ho_Chi_Minh").format().replace("+07:00", "Z");
      let startDateForMat = moment.utc(target.startDate).tz("Asia/Ho_Chi_Minh").format('YYYY-MM-DD');
      let endDateForMat = moment.utc(target.endDate).tz("Asia/Ho_Chi_Minh").format('YYYY-MM-DD');
      if (new Date(startDateForMat).getTime() > new Date(endDateForMat).getTime()) {
        toast.error("EndDate phải lớn hơn StartDate");
        return;
      }
      if(!Number.isInteger(Number(target.cost))) {
        toast.error("Cost phải là số");
        return;
      } else {
        if (target.cost < 0) {
          toast.error("Cost phải là số dương");
          return;
        }
      }
      if (target.customerId == "") {
        target.customerId = "1";
      }
      if (target.departmentId == "") {
        target.departmentId = "1";
      }
      if (target.projectManagerId == "") {
        target.projectManagerId = "1";
      }
      if (target.status == "") {
        target.status = "OPEN";
      }

      fetch("/api/project/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: target.name,
          code: target.code,
          customerId: target.customerId,
          departmentId: target.departmentId,
          startDate: startDate,
          endDate: endDate,
          projectManagerId: target.projectManagerId,
          cost: target.cost,
          costBudget: target.costBudget,
          status: target.status,
          currency: target.currency,
          description: target.description
        }),
      }).then(async (res) => {
        setLoading(false);
        if (res.status === 200) {
          searchProject(false);
          setIsOpen(false);
          setMessage("");
          toast.success("Create project successfully.");
        } else {
          setMessage(await res.text());
        }
      });
    },
    validationSchema: yup.object({
      name: yup.string().trim().required('Required'),
    }),
  });


  const [ index, setIndex ] = useState(1);
  const [ currentIndex, setCurrentIndex ] = useState(-1);

  const [ project, setProject ] = useState({
    id: '',
    name: '',
    code: '',
    customerId: '',
    departmentId: '',
    startDate: new Date(),
    endDate: new Date(),
    projectManagerId: '',
    cost: '',
    costBudget: '',
    status: '',
    currency: '',
    description: '',
  });

  const formikUpdate = useFormik({
    initialValues: project,
    enableReinitialize: true,

    onSubmit: (target: any) => {
      let startDate = moment.utc(target.startDate).tz("Asia/Ho_Chi_Minh").format().replace("+07:00", "Z");
      let endDate = moment.utc(target.endDate).tz("Asia/Ho_Chi_Minh").format().replace("+07:00", "Z");
      let startDateForMat = moment.utc(target.startDate).tz("Asia/Ho_Chi_Minh").format('YYYY-MM-DD');
      let endDateForMat = moment.utc(target.endDate).tz("Asia/Ho_Chi_Minh").format('YYYY-MM-DD');
      if (new Date(startDateForMat).getTime() > new Date(endDateForMat).getTime()) {
        toast.error("EndDate phải lớn hơn StartDate");
        return;
      }
      if(!Number.isInteger(Number(target.cost))) {
        toast.error("Cost phải là số");
        return;
      } else {
        if (target.cost < 0) {
          toast.error("Cost phải là số dương");
          return;
        }
      }
      fetch("/api/project/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: target.id,
          name: target.name,
          code: target.code,
          customerId: target.customerId,
          departmentId: target.departmentId,
          startDate: startDate,
          endDate: endDate,
          projectManagerId: target.projectManagerId,
          cost: target.cost,
          costBudget: target.costBudget,
          status: target.status,
          currency: target.currency,
          description: target.description
        }),
      }).then(async (res) => {
        if (res.status === 200) {
          searchProject(false);
          setCurrentIndex(-1);
          toast.success("Update project information successfully.");
        } else {
          toast.error(await res.text());
          setProject(target);
        }
      });
    },

    validationSchema: yup.object({
      name: yup.string().trim().required('Required'),
    }),
  });


  function objToQueryString(obj: any) {
    const keyValuePairs = [];
    for (const key in obj) {
      keyValuePairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
    }
    return keyValuePairs.join('&');
  }

  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [valueInsightMaster, setValueInsightMaster] = useState(Number);

  const [projectCounts, setProjectCounts] = useState({
    all: 0,
    open: 0,
    pending: 0,
    cancel: 0,
    close: 0
  });

  const getCurrency = async () => {

    fetch(`/api/currency/list`, {
      method: "GET",
      headers: {
          "Content-Type": "application/json",
      }
    }).then(async (res: any) => {
        let data = await res.json();
        const currencyMap: any = new Map();
        for (let y = 0; y < data.currencyRate.length; y++) {
          let currency = data.currencyRate[y];
          currencyMap.set(currency.currency, currency.rate);
        }
        setCurrencyMap(currencyMap);
    })
  }

  const searchProject = async (filter: boolean) => {

    const queryString = objToQueryString({
      keyword: $("#keyword").val(),
      customerId: $("#customer").val(),
      status: $("#search-status").val(),
      page: page,
    });
    fetch(`/api/project/list?${queryString}`, { 
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(async (res: any) => {
      let data = await res.json();
      
      if (!filter) {
        let countOpen = data.projects.filter((x: any) => {
          return x.status === "OPEN"
        }).length;
        let countPending = data.projects.filter((x: any) => {
          return x.status === "PENDING"
        }).length;
        let countCancel = data.projects.filter((x: any) => {
          return x.status === "CANCEL"
        }).length;
        let countClose = data.projects.filter((x: any) => {
          return x.status === "CLOSE"
        }).length;
  
        setProjectCounts(
          {
            all: countOpen + countPending + countCancel + countClose,
            open: countOpen,
            pending: countPending,
            cancel: countCancel,
            close: countClose
          }
        );
      }

      setTotal(data.total);
      setMaxResults(data.maxResults);
      setProjects(data.projects);
      setCustomers(data.customers);
      setDepartments(data.departments);
      setEmployees(data.employees);
      setValueInsightMaster(data.insightMaster[0]?.value);
    });
  };


  // Init search
  useEffect(() => {
    searchProject(false);
    getCurrency();
  }, [page]);


  const confirmProject = async (id: any) => {

    const data = {
      icon: <GoProject />,
      title: "Project Delete",
      message: "Are you sure want to delete this project?"
    }

    confirmAlert({
      customUI: ({ onClose}) => {
        return (
          <ConfirmBox data={data} onClose={onClose} onYes={() => deleteProject({id})} onNo={() => console.log("NO")} />
        );
      }
    });
  };

  const deleteProject = ({ id } : any) => {
    
    fetch("/api/project/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id
      }),
    }).then(async (res) => {
      if (res.status === 200) {
        searchProject(false);
        setCurrentIndex(-1);
        toast.success("Delete project information successfully.");
      } else {
        toast.error(await res.text());
      }
    });
  }

  const nextTab = (project: any) => {
    stateSetProject(project.id, project.name);
    router.push("/project/resource-allocation");
  }

  const changeCost = (event: any) => {
    let cost = event.target.value;
    if(!Number.isInteger(Number(cost))) {
      toast.error("Cost phải là số");
      return;
    } else {
      if (cost < 0) {
        toast.error("Cost phải là số dương");
        return;
      }
    }
    formikAdd.setFieldValue('cost', cost);
    let costBudget = Number(cost) * valueInsightMaster / 100;
    formikAdd.setFieldValue('costBudget', costBudget);
  }

  const changeCostDetail = (event: any) => {
    let cost = event.target.value;
    var num = cost.replace(/\D/g,'');
    if(!Number.isInteger(Number(num))) {
      toast.error("Cost phải là số");
      return;
    } else {
      if (num < 0) {
        toast.error("Cost phải là số dương");
        return;
      }
    }
    formikUpdate.setFieldValue('cost', num);
    let costBudget = Number(num) * valueInsightMaster / 100;
    formikUpdate.setFieldValue('costBudget', costBudget);
  }

  const convertNumberToLocalString = (number: any) => {
    let result = number.toLocaleString("en-US");
    return result;
  }

  const convertCostToCostBudget = (number: any) => {
    let costBudget = Number(number) * valueInsightMaster / 100;
    let result = costBudget.toLocaleString("en-US");
    return result;
  }

  const convertBillableEffort = (number: any) => {
    let valueDefault = currencyMap?.get(currencyDefault);
    let number1 = number.toLocaleString("en-US");

    if (valueDefault) {
      let result1 = Math.round(Number(number) / valueDefault);
      let result2 = result1.toLocaleString("en-US");
      let result = result2 + ' ¥' + ' ~ ' + number1 + ' ₫';
      return result;
    } else {
      return number1;
    }
  }

  const convertMM = (number: any) => {
    let result = Number.parseFloat(number).toFixed(3);
    return result;
  }


  return (
    <>
      <div className={``}>
        <div className="text-lg flex items-center gap-x-4 cursor-pointer rounded-md">
          <span className='text-3xl block float-left'><GoProject /></span>
          <h1>PROJECTS</h1>
        </div>

        <hr className="border-1 border-gray-500 drop-shadow-xl mt-1 mb-2" />

        <div className="flex justify-between xl:w-full">
          <div className="flex justify-center">
            <div className="relative flex rounded-md items-stretch w-auto">
              <input type="hidden" id="search-status" />

              <input type="search" className="relative inline-flex items-center min-w-0 w-full px-3 py-1 text-base 
                rounded-l-md border border-r-0 font-normal text-gray-700 bg-white bg-clip-padding border-solid 
                border-gray-300 transition ease-in-out m-0 focus:text-gray-700 focus:bg-white 
                focus:border-gray-400 focus:outline-none" id="keyword"
                placeholder="Search" />

              <select id="customer" className={`relative inline-flex px-3 pr-5
                appearance-none border border-r-0 font-normal text-gray-700 bg-white bg-clip-padding border-solid 
                border-gray-300 text-sm focus:z-10 
                focus:border-gray-300 focus:outline-none `}>
                <option value="">Customer</option>
                {
                  customers != null && customers.length > 0 ? (
                    customers.map((customer: any, index) => {
                      return (
                        <option key={"customer-" + index} value={customer.id}>{customer.name}</option>
                      )
                    })
                  ) : (<></>)
                }
              </select>

              <button className="btn px-2.5 py-2 font-medium text-base leading-tight uppercase
                rounded-r-md hover:bg-gray-500 hover:text-white border border-gray-300 bg-white
                flex items-center" type="button" onClick={() => searchProject(false)}>
                <FiSearch />
              </button>
            </div>
              
            <button className="ml-2 btn px-2 py-2 font-medium text-base leading-tight uppercase 
              rounded-md  hover:bg-gray-700 hover:text-white border border-gray-300 bg-white
              flex items-center" type="button" onClick={() => {
                $("#keyword").val(""); $("#customer").val(""); $("#search-status").val(""); searchProject(false);
              }}>
              <MdOutlineClear />
            </button>

            <button className="ml-2 btn px-2 py-1 font-normal text-sm leading-tight uppercase text-white
              rounded-md  hover:bg-blue-500 hover:text-white border border-blue-600 bg-blue-600
              flex items-center" type="button" onClick={() => {
                $("#search-status").val(""); searchProject(true);
              }}>
              {projectCounts.all} Total
            </button>
            <button className="ml-2 btn px-2 py-2 font-normal text-sm leading-tight uppercase text-white
              rounded-md  hover:bg-green-500 hover:text-white border border-green-600 bg-green-600
              flex items-center" type="button" onClick={() => {
                $("#search-status").val("OPEN"); searchProject(true);
              }}>
              {projectCounts.open} Open
            </button>
            <button className="ml-2 btn px-2 py-2 font-normal text-sm leading-tight uppercase text-white
              rounded-md  hover:bg-orange-500 hover:text-white border border-orange-600 bg-orange-600
              flex items-center" type="button" onClick={() => {
                $("#search-status").val("PENDING"); searchProject(true);
              }}>
              {projectCounts.pending} Pending
            </button>
            <button className="ml-2 btn px-2 py-2 font-normal text-sm leading-tight uppercase text-white
              rounded-md  hover:bg-gray-900 hover:text-white border border-black bg-black
              flex items-center" type="button" onClick={() => {
                $("#search-status").val("CLOSE"); searchProject(true);
              }}>
              {projectCounts.close} Close
            </button>
            <button className="ml-2 btn px-2 py-2 font-normal text-sm leading-tight uppercase text-white
              rounded-md  hover:bg-gray-400 hover:text-white border border-gray-500 bg-gray-500
              flex items-center" type="button" onClick={() => {
                $("#search-status").val("CANCEL"); searchProject(true);
              }}>
              {projectCounts.cancel} Cancel
            </button>
          </div>

          {
            session?.data?.user?.role === "ADMIN" ? 
            <div>
              <button className="ml-2 inline-flex items-center px-6 py-2 bg-dark-blue hover:bg-indigo-600 text-white 
                text-sm font-medium rounded-md" type="button" onClick={() =>{ setIsOpen(true); formikAdd.setErrors({}); formikAdd.setFieldValue('costBudget', '')}}>
                <BsPlusCircleFill />&nbsp;
                New Project
              </button>
            </div> : <></>
          }
          
        </div>

        <div className="mx-auto mt-2" id="search-area">
          <div className="flex flex-col">
            <div className="overflow-x-auto rounded-t-lg test-height">
              <div className="inline-block w-full align-middle">
                <div className="overflow-hidden ">
                  
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
                            Project Name
                          </th>
                          <th scope="col" className="w-[90px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Customer
                          </th>
                          <th scope="col" className="w-[90px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Department
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
                            Rank
                          </th>
                          <th scope="col" className="w-[90px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Status
                          </th>
                          <th scope="col" className="w-[80px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            PM
                          </th>
                          <th scope="col" className="w-[80px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody className="bg-white">
                        {
                          projects != null && projects.length > 0 ? (
                            projects.map((project: any, index) => {
                              
                              return (
                                <tr className="hover:bg-gray-100" key={"project-" + index}>
                                  <td className="p-2 border border-gray-300 text-center">
                                    <div className="flex items-center">
                                      <input id="checkbox-table-1" type="checkbox" className="w-4 h-4 rounded 
                                        border-gray-300" />
                                      <label htmlFor="checkbox-table-1" className="sr-only">checkbox</label>
                                      <input type="hidden" name="id" value={formikUpdate.values.id} onChange={formikUpdate.handleChange}/>
                                    </div>
                                  </td>
  
                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`}>
                                    <span className={` ${(index == currentIndex) && "hidden"}`}>{project.name}</span>
                                    <input type="text" className={` ${(index != currentIndex) && "hidden"} 
                                      py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 
                                      focus:border-gray-300 focus:outline-none bg-table-input 
                                      ${formikUpdate.errors.name && "error-validate"}`} 
                                      name="name"
                                      value={formikUpdate.values.name}
                                      onChange={formikUpdate.handleChange}
                                      onBlur={formikUpdate.handleBlur} 
                                      placeholder={formikUpdate.errors.name && formikUpdate.errors.name}  />
                                  </td>
  
                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-500 text-center border border-gray-300`}>
                                    <span className={` ${(index == currentIndex) && "hidden"}`}>{project.customerCode}</span>
                                    <select id="customer-ids" className={` ${(index != currentIndex) && "hidden"} 
                                      appearance-none block border border-t-0 border-gray-200 text-sm focus:z-10 
                                      focus:border-gray-300 focus:outline-none bg-table-input w-full`} 
                                      name="customerId"
                                      value={formikUpdate.values.customerId}
                                      onChange={formikUpdate.handleChange}
                                      onBlur={formikUpdate.handleBlur}>
                                      {
                                        customers != null && customers.length > 0 ? (
                                          customers.map((customer: any, index) => {
                                            return (
                                              <option key={"customer-a-" + index} value={customer.id}>{customer.code}</option>
                                            )
                                          })
                                        ) : (<></>)
                                      }
                                    </select>
                                  </td>
  
                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300 text-center`}>
                                    <span className={` ${(index == currentIndex) && "hidden"}`}>{project.departmentName}</span>
                                    <select id="department-ids" className={` ${(index != currentIndex) && "hidden"} 
                                      appearance-none block border border-t-0 border-gray-200 text-sm focus:z-10 
                                      focus:border-gray-300 focus:outline-none bg-table-input w-full`} 
                                      name="departmentId"
                                      value={formikUpdate.values.departmentId}
                                      onChange={formikUpdate.handleChange}
                                      onBlur={formikUpdate.handleBlur}>
                                      {
                                        departments != null && departments.length > 0 ? (
                                          departments.map((department: any, index) => {
                                            return (
                                              <option key={"department-" + index} value={department.id}>{department.name}</option>
                                            )
                                          })
                                        ) : (<></>)
                                      }
                                    </select>
                                  </td>

                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`}>
                                    <span className={` ${(index == currentIndex) ? "hidden" : "block"} w-full text-center`}>
                                      {project.startDate}
                                    </span>
                                    <Calendar
                                      id="startDate" 
                                      className={` calendar-picker cell-calendar-picker bg-table-input`}
                                      dateFormat="yy-mm-dd"
                                      name='startDate'
                                      value={formikUpdate.values.startDate}
                                      onChange={formikUpdate.handleChange}
                                      style={(index != currentIndex) ? {display: "none"} : {}}
                                    />
                                  </td>

                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`}>
                                    <span className={` ${(index == currentIndex) ? "hidden" : "block"} w-full text-center`}>
                                      {project.endDate}
                                    </span>
                                    <Calendar
                                      id="endDate" 
                                      className={` calendar-picker cell-calendar-picker bg-table-input`}
                                      dateFormat="yy-mm-dd"
                                      name='endDate'
                                      value={formikUpdate.values.endDate}
                                      onChange={formikUpdate.handleChange}
                                      style={(index != currentIndex) ? {display: "none"} : {}}
                                    />
                                  </td>
  
                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm 
                                    font-normal text-gray-900 border border-gray-300`}>
                                    <span className={`block text-right`}>
                                      {project.rank ? project.rank : ""}
                                    </span>
                                  </td>
  
                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm 
                                    font-normal text-center text-gray-900 border border-gray-300`}>
                                    <span className={` ${(index == currentIndex) ? "hidden" : "block"} text-center`}>
                                      {project.status}
                                    </span>
                                    <select id="project-statuses" className={` ${(index != currentIndex) && "hidden"} 
                                      appearance-none block border border-t-0 border-gray-200 text-sm focus:z-10 
                                      focus:border-gray-300 focus:outline-none bg-table-input w-full`} 
                                      name="status"
                                      value={formikUpdate.values.status}
                                      onChange={formikUpdate.handleChange}
                                      onBlur={formikUpdate.handleBlur}>
                                      <option value="OPEN">OPEN</option>
                                      <option value="PENDING">PENDING</option>
                                      <option value="CANCEL">CANCEL</option>
                                      <option value="CLOSE">CLOSE</option>
                                    </select>
                                  </td>
  
                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`}>
                                    <span className={` ${(index == currentIndex) ? "hidden" : "block"} text-center`}>
                                      {project.projectManagerCode}
                                    </span>
                                    <select id="project-manager-ids"  className={` ${(index != currentIndex) && "hidden"} 
                                        appearance-none block border border-t-0 border-gray-200 text-sm focus:z-10 
                                        focus:border-gray-300 focus:outline-none bg-table-input w-full`} 
                                        name="status"
                                        value={formikUpdate.values.projectManagerId}
                                        onChange={formikUpdate.handleChange}
                                        onBlur={formikUpdate.handleBlur} >
                                      {
                                        employees != null && employees.length > 0 ? (
                                          employees.map((employee: any, index) => {
                                            return (
                                              <option key={"employee-" + index} value={employee.id}>{employee.code}</option>
                                            )
                                          })
                                        ) : (<></>)
                                      }
                                    </select>
                                  </td>
                                  {
                                    session?.data?.user?.role !== "MANAGER" ? 
                                    <td className="p-2 text-sm font-normal text-center border border-gray-300">
                                    {
                                      index == currentIndex ? (
                                        <>
                                          <a href="#" className="text-base text-blue-600 hover:underline mr-1" style={{marginLeft: "margin-left: 0.75rem;"}}
                                            onClick={() => { 
                                              $('#btn-update-customer').click(); 
                                              return false;
                                            } } >
                                              <FaSave />
                                          </a>
                                          <button id="btn-update-customer" className="hidden items-center px-3 
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
                                              setProject({
                                                id: project.id,
                                                name: project.name,
                                                code: project.code,
                                                customerId: project.customerId,
                                                departmentId: project.departmentId,
                                                startDate: moment(project.startDate, "YYYY-MM-DD").toDate(),
                                                endDate: moment(project.endDate, "YYYY-MM-DD").toDate(),
                                                projectManagerId: project.projectManagerId,
                                                cost: project.cost,
                                                costBudget: project.costBudget,
                                                status: project.status,
                                                currency: project.currency,
                                                description: project.description
                                              });
                                              formikUpdate.setValues({
                                                id: project.id,
                                                name: project.name,
                                                code: project.code,
                                                customerId: project.customerId,
                                                departmentId: project.departmentId,
                                                startDate: moment(project.startDate, "YYYY-MM-DD").toDate(),
                                                endDate: moment(project.endDate, "YYYY-MM-DD").toDate(),
                                                projectManagerId: project.projectManagerId,
                                                cost: project.cost,
                                                costBudget: project.costBudget,
                                                status: project.status,
                                                currency: project.currency,
                                                description: project.description
                                              });
                                              setCurrentIndex(index);
                                            }}>
                                              <RiFileEditFill />
                                          </a>
                                          <a href="#" className="text-base text-red-600 hover:underline float-left mr-1" 
                                            onClick={() => { confirmProject(project.id) }}>
                                            <RiDeleteBin2Fill />
                                          </a>
                                          <a href="#" className="text-base text-green-600 hover:underline" 
                                            onClick={() => {
                                              setCurrencyDefault(project.currency);
                                              formikUpdate.setValues({
                                                id: project.id,
                                                name: project.name,
                                                code: project.code,
                                                customerId: project.customerId,
                                                departmentId: project.departmentId,
                                                startDate: moment(project.startDate, "YYYY-MM-DD").toDate(),
                                                endDate: moment(project.endDate, "YYYY-MM-DD").toDate(),
                                                projectManagerId: project.projectManagerId,
                                                cost: project.cost,
                                                costBudget: project.costBudget,
                                                status: project.status,
                                                currency: project.currency,
                                                description: project.description
                                              });
                                              getProjectDetail(project.id); }}>
                                            <FaInfoCircle />
                                          </a>
                                        </>
                                      )
                                    }
                                  </td> :
                                  <td className="p-2 text-sm font-normal text-center border border-gray-300">
                                    <a href="#" className="text-base text-green-600 hover:underline" 
                                      onClick={() => {
                                        formikUpdate.setValues({
                                          id: project.id,
                                          name: project.name,
                                          code: project.code,
                                          customerId: project.customerId,
                                          departmentId: project.departmentId,
                                          startDate: moment(project.startDate, "YYYY-MM-DD").toDate(),
                                          endDate: moment(project.endDate, "YYYY-MM-DD").toDate(),
                                          projectManagerId: project.projectManagerId,
                                          cost: project.cost,
                                          costBudget: project.costBudget,
                                          status: project.status,
                                          currency: project.currency,
                                          description: project.description
                                        });
                                        getProjectDetail(project.id); }}>
                                      <FaInfoCircle />
                                    </a>
                                  </td>
                                  }
                                  
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


        <div id="modals" />

        <Modal 
          isOpen={isOpen} 
          ariaHideApp={false} 
          onRequestClose={() => setIsOpen(false)} 
          style={customModalStyles}>

          <div className="text-lg flex items-center gap-x-4 cursor-pointer rounded-md">
            <span className='text-3xl block float-left'><GoProject /></span>
            <h1>Project Information</h1>
          </div>

          <div hidden={message == ""} className="mt-2 mb-2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative text-sm" 
            role="alert">
            <span className="block sm:inline">{message}</span>
          </div>

          <form className="" onSubmit={formikAdd.handleSubmit}>
            <div className='mt-3'>
              <div className="flex">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Project Name
                </span>
                <input type="text" className={`py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 
                  focus:border-gray-300 focus:outline-none ${formikAdd.errors.name && "error-validate"}`} 
                  name="name"
                  onChange={formikAdd.handleChange}
                  onBlur={formikAdd.handleBlur} placeholder={formikAdd.errors.name && formikAdd.errors.name}  />
              </div>

              <div className="flex">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Code
                </span>
                <input type="text" className={`py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                  focus:z-10 focus:border-gray-300 focus:outline-none ${formikAdd.errors.name && "error-validate"}`} 
                  name="code"
                  onChange={formikAdd.handleChange}
                  onBlur={formikAdd.handleBlur} placeholder={formikAdd.errors.code && formikAdd.errors.code} />
              </div>

              <div className="flex relative">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Customer
                </span>
                <div className="w-full relative">
                  <select id="countries" className="appearance-none py-1 px-3 pr-11 block w-full border border-t-0 
                      border-gray-200 text-sm focus:z-10 focus:border-gray-300 focus:outline-none" 
                      name="customerId"
                      onChange={formikAdd.handleChange}
                      onBlur={formikAdd.handleBlur} >
                    {
                      customers != null && customers.length > 0 ? (
                        customers.map((customer: any, index) => {
                          return (
                            <option key={"customer-b-" + index} value={customer.id}>{customer.name}</option>
                          )
                        })
                      ) : (<></>)
                    }
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex relative">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Department
                </span>
                <div className="w-full relative">
                  <select id="department-ids" className="appearance-none py-1 px-3 pr-11 block w-full border border-t-0 
                      border-gray-200 text-sm focus:z-10 focus:border-gray-300 focus:outline-none" 
                      name="departmentId"
                      onChange={formikAdd.handleChange}
                      onBlur={formikAdd.handleBlur} >
                    {
                      departments != null && departments.length > 0 ? (
                        departments.map((department: any, index) => {
                          return (
                            <option key={"department-b-" + index} value={department.id}>{department.name}</option>
                          )
                        })
                      ) : (<></>)
                    }
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Start Date
                </span>
                <Calendar
                  id="startDate"
                  className="calendar-picker border border-t-0 border-gray-200"
                  dateFormat="yy-mm-dd"
                  name='startDate'
                  onChange={formikAdd.handleChange}
                />
              </div>

              <div className="flex">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  End Date
                </span>
                <Calendar
                  id="endDate"
                  className="calendar-picker border border-t-0 border-gray-200"
                  dateFormat="yy-mm-dd"
                  name='endDate'
                  onChange={formikAdd.handleChange}
                />
              </div>

              <div className="flex">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Project Manager
                </span>
                <div className="w-full relative">
                  <select id="project-manager-ids" className="appearance-none py-1 px-3 pr-11 block w-full border border-t-0 
                      border-gray-200 text-sm focus:z-10 focus:border-gray-300 focus:outline-none" 
                      name="projectManagerId"
                      onChange={formikAdd.handleChange}
                      onBlur={formikAdd.handleBlur} >
                    {
                      employees != null && employees.length > 0 ? (
                        employees.map((employee: any, index) => {
                          return (
                            <option key={"employee-b-" + index} value={employee.id}>{employee.name}</option>
                          )
                        })
                      ) : (<></>)
                    }
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Cost
                </span>
                <input type="text" className="py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                  focus:z-10 focus:border-gray-300 focus:outline-none"
                  name="cost"
                  onChange={changeCost}
                  onBlur={formikAdd.handleBlur} />
              </div>

              <div className="flex">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Cost Budget
                </span>
                <input type="text" className="py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                  focus:z-10 focus:border-gray-300 focus:outline-none" disabled
                  name="costBudget"
                  value={formikAdd.values.costBudget} />
              </div>

              <div className="flex relative">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Currency
                </span>
                <div className="w-full relative">
                  <select id="status" className="appearance-none py-1 px-3 pr-11 block w-full border border-t-0 
                      border-gray-200 text-sm focus:z-10 focus:border-gray-300 focus:outline-none" 
                      name="currency"
                      onChange={formikAdd.handleChange}
                      onBlur={formikAdd.handleBlur} >
                    <option value="VND" selected>VND</option>
                    <option value="JPY">JPY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex relative">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Status
                </span>
                <div className="w-full relative">
                  <select id="status" className="appearance-none py-1 px-3 pr-11 block w-full border border-t-0 
                      border-gray-200 text-sm focus:z-10 focus:border-gray-300 focus:outline-none" 
                      name="status"
                      onChange={formikAdd.handleChange}
                      onBlur={formikAdd.handleBlur} >
                    <option value="OPEN">OPEN</option>
                    <option value="PENDING">PENDING</option>
                    <option value="CANCEL">CANCEL</option>
                    <option value="CLOSE">CLOSE</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Description
                </span>
                <textarea className="py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                  focus:z-10 focus:border-gray-300 focus:outline-none" rows={2}
                  name="description"
                  onChange={formikAdd.handleChange}
                  onBlur={formikAdd.handleBlur} />
              </div>
            </div>

            <div className='mt-3 flex justify-between'>
              <button className="inline-flex items-center px-3 py-2 bg-gray-400 hover:bg-gray-600 text-white 
                text-sm font-medium rounded-md" type="button" onClick={() => setIsOpen(false)}>
                <span className='text-xl block float-left mr-2'><MdCancel /></span>
                Cancel
              </button>

              <button className="inline-flex items-center px-3 py-2 bg-arius-green hover:bg-light-green text-white 
                text-sm font-medium rounded-md" type="submit" 
                disabled={loading}>
                  {
                    loading ? (
                      <LoadingDots color="#808080" />
                    ) : (
                      <>
                        <span className='text-xl block float-left mr-2'><AiFillSave /></span>Save
                      </>
                    )
                  }
              </button>
            </div>
          </form>
          
        </Modal>
        
        <div id='detail'></div>
        <Modal 
          isOpen={isOpenDetail} 
          ariaHideApp={false} 
          onRequestClose={() => setIsOpenDetail(false)} 
          style={customModalDetalStyles}>

          <div className="text-lg flex items-center gap-x-4 cursor-pointer rounded-md">
            <span className='text-3xl block float-left'><GoProject /></span>
            <h1>Project Information</h1>
          </div>

          <form className="" onSubmit={formikUpdate.handleSubmit}>
            <div className='mt-3'>
              <div className="flex">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Project Name
                </span>
                {session?.data?.user?.role !== "MANAGER" ? 
                  <input type="text" className={`py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 
                  focus:border-gray-300 focus:outline-none ${formikUpdate.errors.name && "error-validate"}`} 
                  name="name" 
                  value={formikUpdate.values.name}
                  onChange={formikUpdate.handleChange}
                  onBlur={formikUpdate.handleBlur}   
                  placeholder={formikUpdate.errors.name && formikUpdate.errors.name} />
                  : 
                  <input type="text" className={`py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 
                  focus:border-gray-300 focus:outline-none ${formikUpdate.errors.name && "error-validate"}`} 
                  name="name" disabled
                  value={formikUpdate.values.name} />
                }
                
              </div>

              <div className="flex">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Code
                </span>
                {
                  session?.data?.user?.role !== "MANAGER" ? 
                  <input type="text" className={`py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                  focus:z-10 focus:border-gray-300 focus:outline-none ${formikUpdate.errors.code && "error-validate"}`} 
                  name="code"
                  value={formikUpdate.values.code}
                  onChange={formikUpdate.handleChange}
                  onBlur={formikUpdate.handleBlur} 
                  placeholder={formikUpdate.errors.code && formikUpdate.errors.code} />
                  : 
                  <input type="text" className={`py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                  focus:z-10 focus:border-gray-300 focus:outline-none ${formikUpdate.errors.code && "error-validate"}`} 
                  name="code" disabled
                  value={formikUpdate.values.code}
                  />
                }
                
              </div>

              <div className="flex relative">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Customer
                </span>
                <div className="w-full relative">
                  {
                    session?.data?.user?.role !== "MANAGER" ? 
                    <select id="countries" className={`appearance-none py-1 px-3 pr-11 block w-full border border-t-0 
                      border-gray-200 text-sm focus:z-10 focus:border-gray-300 focus:outline-none`} 
                      name="customerId"
                      value={formikUpdate.values.customerId}
                      onChange={formikUpdate.handleChange}
                      onBlur={formikUpdate.handleBlur} >
                      {
                        customers != null && customers.length > 0 ? (
                          customers.map((customer: any, index) => {
                            return (
                              <option key={"customer-b-" + index} value={customer.id}>{customer.name}</option>
                            )
                          })
                        ) : (<></>)
                      }
                    </select> :
                    <select id="countries" className={`appearance-none py-1 px-3 pr-11 block w-full border border-t-0 
                    border-gray-200 text-sm focus:z-10 focus:border-gray-300 focus:outline-none`} 
                    name="customerId" disabled
                    value={formikUpdate.values.customerId}>
                    </select>
                  }
                  
                </div>
              </div>

              <div className="flex relative">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Department
                </span>
                <div className="w-full relative">
                  {
                    session?.data?.user?.role !== "MANAGER" ? 
                    <select id="department-ids" className={`appearance-none py-1 px-3 pr-11 block w-full border border-t-0 
                      border-gray-200 text-sm focus:z-10 focus:border-gray-300 focus:outline-none`} 
                      name="departmentId"
                      value={formikUpdate.values.departmentId}
                      onChange={formikUpdate.handleChange}
                      onBlur={formikUpdate.handleBlur} >
                    {
                      departments != null && departments.length > 0 ? (
                        departments.map((department: any, index) => {
                          return (
                            <option key={"department-b-" + index} value={department.id}>{department.name}</option>
                          )
                        })
                      ) : (<></>)
                    }
                  </select>:
                  <select id="department-ids" className={`appearance-none py-1 px-3 pr-11 block w-full border border-t-0 
                    border-gray-200 text-sm focus:z-10 focus:border-gray-300 focus:outline-none`} 
                    name="departmentId" disabled
                    value={formikUpdate.values.departmentId}>
                  </select>
                  }
                  
                </div>
              </div>

              <div className="flex">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Start Date
                </span>
                {
                  session?.data?.user?.role !== "MANAGER" ? 
                  <Calendar
                    id="startDate"
                    className="calendar-picker border border-t-0 border-gray-200"
                    dateFormat="yy-mm-dd"
                    name='startDate'
                    value={formikUpdate.values.startDate}
                    onChange={formikUpdate.handleChange}
                  />:
                  <Calendar
                    id="startDate"
                    className="calendar-picker border border-t-0 border-gray-200"
                    dateFormat="yy-mm-dd"
                    disabled
                    name='startDate'
                    value={formikUpdate.values.startDate}
                  />
                }
                
              </div>

              <div className="flex">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  End Date
                </span>
                {
                  session?.data?.user?.role !== "MANAGER" ? 
                  <Calendar
                    id="endDate"
                    className="calendar-picker border border-t-0 border-gray-200"
                    dateFormat="yy-mm-dd"
                    name='endDate'
                    value={formikUpdate.values.endDate}
                    onChange={formikUpdate.handleChange}
                  />
                  :
                  <Calendar
                    id="endDate"
                    className="calendar-picker border border-t-0 border-gray-200"
                    dateFormat="yy-mm-dd"
                    name='endDate'
                    value={formikUpdate.values.endDate}
                    disabled
                  />
                }
                
              </div>
              
              <div className="flex">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Project Manager
                </span>
                <div className="w-full relative">
                  {
                    session?.data?.user?.role !== "MANAGER" ? 
                    <select id="project-manager-ids" className={`appearance-none py-1 px-3 pr-11 block w-full border border-t-0 
                      border-gray-200 text-sm focus:z-10 focus:border-gray-300 focus:outline-none`} 
                      name="projectManagerId"
                      value={formikUpdate.values.projectManagerId}
                      onChange={formikUpdate.handleChange}
                      onBlur={formikUpdate.handleBlur} >
                      {
                        employees != null && employees.length > 0 ? (
                          employees.map((employee: any, index) => {
                            return (
                              <option key={"employee-b-" + index} value={employee.id}>{employee.code}</option>
                            )
                          })
                        ) : (<></>)
                      }
                    </select>:
                    <select id="project-manager-ids" className={`appearance-none py-1 px-3 pr-11 block w-full border border-t-0 
                      border-gray-200 text-sm focus:z-10 focus:border-gray-300 focus:outline-none`} 
                      name="projectManagerId" disabled
                      value={formikUpdate.values.projectManagerId}>
                    </select>
                  }
                  
                </div>
              </div>

              <div className="flex">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Cost
                </span>
                {
                  session?.data?.user?.role !== "MANAGER" ? 
                  <input type="text" className={`py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                  focus:z-10 focus:border-gray-300 focus:outline-none`}
                  name="cost"
                  value={formikUpdate.values.cost ? convertNumberToLocalString(formikUpdate.values.cost) : ''}
                  onChange={changeCostDetail} /> :
                  <input type="text" className={`py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                  focus:z-10 focus:border-gray-300 focus:outline-none`}
                  name="cost" disabled
                  value={formikUpdate.values.cost ? convertNumberToLocalString(formikUpdate.values.cost) : ''}/>
                }
                
              </div>

              <div className="flex">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Cost Budget
                </span>
                <input type="text" className={`py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                  focus:z-10 focus:border-gray-300 focus:outline-none`} disabled
                  name="costBudget"
                  value={formikUpdate.values.cost ? convertCostToCostBudget(formikUpdate.values.cost) : ''} />
              </div>

              <div className="flex">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Billable Effort
                </span>
                <input type="text" className={`py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                  focus:z-10 focus:border-gray-300 focus:outline-none`} disabled
                  name="billableEffort"
                  value={billableEffort ? convertBillableEffort(billableEffort) : ''} />
              </div>

              <div className="flex relative">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Currency
                </span>
                <div className="w-full relative">
                  {
                    session?.data?.user?.role !== "MANAGER" ? 
                    <select id="status" className={`appearance-none py-1 px-3 pr-11 block w-full border border-t-0 
                      border-gray-200 text-sm focus:z-10 focus:border-gray-300 focus:outline-none`} 
                      name="currency"
                      value={formikUpdate.values.currency}
                      onChange={formikUpdate.handleChange}
                      onBlur={formikUpdate.handleBlur} >
                      <option value="VND" selected>VND</option>
                      <option value="JPY">JPY</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select> :
                    <select id="currency" className={`appearance-none py-1 px-3 pr-11 block w-full border border-t-0 
                      border-gray-200 text-sm focus:z-10 focus:border-gray-300 focus:outline-none`} 
                      name="currency" disabled
                      value={formikUpdate.values.currency}>
                    </select>
                  }
                  
                </div>
              </div>

              <div className="flex relative">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Status
                </span>
                <div className="w-full relative">
                  {
                    session?.data?.user?.role !== "MANAGER" ? 
                    <select id="status" className={`appearance-none py-1 px-3 pr-11 block w-full border border-t-0 
                      border-gray-200 text-sm focus:z-10 focus:border-gray-300 focus:outline-none`} 
                      name="status"
                      value={formikUpdate.values.status}
                      onChange={formikUpdate.handleChange}
                      onBlur={formikUpdate.handleBlur} >
                      <option value="OPEN">OPEN</option>
                      <option value="PENDING">PENDING</option>
                      <option value="CANCEL">CANCEL</option>
                      <option value="CLOSE">CLOSE</option>
                    </select> :
                    <select id="status" className={`appearance-none py-1 px-3 pr-11 block w-full border border-t-0 
                      border-gray-200 text-sm focus:z-10 focus:border-gray-300 focus:outline-none`} 
                      name="status" disabled
                      value={formikUpdate.values.status}>
                    </select>
                  }
                  
                </div>
              </div>

              <div className="flex">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Description
                </span>
                {
                  session?.data?.user?.role !== "MANAGER" ? 
                  <textarea className={`py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                    focus:z-10 focus:border-gray-300 focus:outline-none`} rows={2}
                    name="description"
                    value={formikUpdate.values.description}
                    onChange={formikUpdate.handleChange}
                    onBlur={formikUpdate.handleBlur} /> :
                    <textarea className={`py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                    focus:z-10 focus:border-gray-300 focus:outline-none`} rows={2}
                    name="description" disabled
                    value={formikUpdate.values.description} />
                }
                
              </div>
            </div>

            
          <br/>
          <div className="flex items-center p-1 pl-3 border-4 border-t-0 border-b-[1px] border-r-0  border-light-blue border-b-gray-200 border-t-gray-200 bg-gray-100">
            <span className="text-sm">Resource Allocation</span>
            <span className='text-xl cursor-pointer' onClick={() => nextTab(formikUpdate.values)} style={{marginLeft: 'auto'}}><FaShareSquare/></span>
          </div>
          <br/>
          <div className='table-container h-[300px]' id='table-scroll'>
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-light-blue">
                <tr>
                  <th scope="col" className="w-[250px] p-2 border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase">
                    User
                  </th>
                  <th scope="col" className="w-[90px] p-2 border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase">
                    Role
                  </th>
                  <th scope="col" className="w-[90px] p-2 border border-gray-300 bg-light-blue text-white 
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
                </tr>
              </thead>
              <tbody className="bg-white">
                {
                  resourceAllocations != null && resourceAllocations.length > 0 ? (
                    resourceAllocations.map((resourceAllocation: any, index) => {
                      
                      return (
                        <tr className="hover:bg-gray-100" key={"project-" + index}>
                          <td className={`"p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300 break-all`}>
                            <span>{resourceAllocation.name}</span>
                          </td>

                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300`}>
                            <span>{resourceAllocation.position}</span>
                          </td>

                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300 text-right`}>
                            <span>{resourceAllocation.planEffort}</span>
                          </td>

                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300`}>
                            <span className={`w-full text-center`}>
                              {resourceAllocation.startDate}
                            </span>
                          </td>

                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300`}>
                            <span className={`w-full text-center`}>
                              {resourceAllocation.endDate}
                            </span>
                          </td>

                          <td className={`p-2 text-sm font-normal 
                            text-gray-900 border border-gray-300 text-right`}>
                            <span>{resourceAllocation.mm ? convertMM(resourceAllocation.mm) : ''}</span>
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
            </div>
            {
              session?.data?.user?.role !== "MANAGER" ? 
              <div className='mt-3 flex justify-between'>
                <button className="inline-flex items-center px-3 py-2 bg-gray-400 hover:bg-gray-600 text-white 
                  text-sm font-medium rounded-md" type="button" onClick={() => setIsOpenDetail(false)}>
                  <span className='text-xl block float-left mr-2'><MdCancel /></span>
                  Cancel
                </button>

                

                <button className="inline-flex items-center px-3 py-2 bg-arius-green hover:bg-light-green text-white 
                  text-sm font-medium rounded-md" type="submit" 
                  disabled={loading}>
                    {
                      loading ? (
                        <LoadingDots color="#808080" />
                      ) : (
                        <>
                          <span className='text-xl block float-left mr-2'><AiFillSave /></span>Save
                        </>
                      )
                    }
                </button>
              </div> : <></>
            }
            
          </form>
        </Modal>

      </div>
    </>
  );
}
