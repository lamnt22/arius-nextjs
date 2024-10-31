"use client"

import React, { useEffect, useState } from 'react'

import $ from "jquery"
import { Field, FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';

import Pagination from "react-js-pagination";

import moment from "moment-timezone";

import toast from "react-hot-toast";

import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

import { FaInfoCircle } from "react-icons/fa"
import { FiSearch, FiSend } from "react-icons/fi"
import { MdOutlineClear, MdCancel, MdSaveAlt } from "react-icons/md"
import { RiFileEditFill, RiDeleteBin2Fill } from "react-icons/ri"
import { BsPlusCircleFill } from "react-icons/bs"
import { FaSave } from "react-icons/fa"
import { GiReceiveMoney } from "react-icons/gi"

import ConfirmBox from "../../../components/confirm"

import "primereact/resources/themes/lara-light-indigo/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";                                //icons

import { Calendar } from 'primereact/calendar';



const typeMoney = new Map();
typeMoney.set('JPY', '¥');
typeMoney.set('USD', '$');
typeMoney.set('EUR', '€');

export default function Expense(props: any) {

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  const [maxResults, setMaxResults] = useState(10);

  const handlePagination = async (page:any) => {
    setPage(page);
  }

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [isIncomeCreate, setIncomeCreate] = useState(false);

  const formikAdd = useFormik({
    initialValues: {
      incomeDate: new Date(),
      type: '',
      amount: '',
      currency: '',
      detail: '',
      requestBy: '',
      referenceId: '',
      processDate: new Date(),
    },
    onSubmit: (target: any) => {
      let incomeDate = moment.utc(target.incomeDate).tz("Asia/Ho_Chi_Minh").format().replace("+07:00", "Z");

      if (target.type == "") {
        target.type = "OTHERS";
      }
      if (target.currency == "") {
        target.currency = "VND";
      }
      fetch("/api/finance/income/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          incomeDate: incomeDate,
          type: target.type,
          amount: target.amount,
          currency: target.currency,
          detail: target.detail,
          referenceId: target.referenceId, 
          email: props?.params?.loginUserEmail,
        }),
      }).then(async (res) => {
        setLoading(false);
        if (res.status === 200) {
          searchIncome();
          setMessage("");
          toast.success("Save income information successfully.");
        } else {
          setMessage(await res.text());
        }
      });
    },
    validationSchema: yup.object({
      amount: yup.string().trim().required('Required'),
      detail: yup.string().trim().required('Required'),
    }),
  });


  const [ currentIndex, setCurrentIndex ] = useState(-1);

  const [ income, setIncome ] = useState({
    id: '',
    incomeDate: new Date(),
    type: '',
    amount: '',
    currency: '',
    detail: '',
    requestBy: '',
    referenceId: '',
    processDate: new Date(),
  });

  const formikUpdate = useFormik({
    initialValues: income,
    enableReinitialize: true,

    onSubmit: (target: any) => {
      let incomeDate = moment.utc(target.requestDate).tz("Asia/Ho_Chi_Minh").format().replace("+07:00", "Z");

      fetch("/api/finance/income/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: target.id,
          incomeDate: incomeDate,
          type: target.type,
          amount: target.amount,
          currency: target.currency,
          detail: target.detail,
          projectId: target.referenceId,
          email: props?.params?.loginUserEmail,
        }),
      }).then(async (res) => {
        if (res.status === 200) {
          searchIncome();
          setCurrentIndex(-1);
          toast.success("Update income information successfully.");
        } else {
          toast.error(await res.text());
          setIncome(target);
        }
      });
    },

    validationSchema: yup.object({
      amount: yup.string().trim().required('Required'),
      detail: yup.string().trim().required('Required'),
    }),
  });


  function objToQueryString(obj: any) {
    const keyValuePairs = [];
    for (const key in obj) {
      keyValuePairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
    }
    return keyValuePairs.join('&');
  }

  const [incomes, setIncomes] = useState([]); 
  const [projects, setProjects] = useState([]); 

  const searchIncome = async () => {

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

        const queryString = objToQueryString({
          keyword: $("#keyword").val(),
          type: $("#search-income-type").val(),
          projectId: $("#search-income-projects").val(),
          page: page,
        });
        fetch(`/api/finance/income/list?${queryString}`, { 
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        }).then(async (res: any) => {
          let data = await res.json();
    
          setTotal(data.total);
          setMaxResults(data.maxResults);

          const incomeList: any = [];
          for (let j = 0; j < data.incomes.length; j++) {
            let i: any = data.incomes[j];

            let tiente = i.currency;

            let numberDefault = currencyMap.get(tiente);

            if (numberDefault) {
              let type = typeMoney.get(tiente);
              let amountAll1 = Math.round(i.amount / numberDefault);
              let amountAll = amountAll1.toLocaleString("en-US") + ' ' + type;
              i = { ...i, "amountAll": amountAll };
            } else {
              let amountAll1 = i.amount;
              let amountAll = amountAll1.toLocaleString("en-US") + ' ₫';
              i = { ...i, "amountAll": amountAll };
            }

            incomeList.push(i);

          }

          setIncomes(incomeList);
          setProjects(data.projects);
        });
    });

    
  };


  // Init search
  useEffect(() => {
    searchIncome();
  }, [page]);


  const confirmIncome = async (id: any) => {

    const data = {
      icon: <GiReceiveMoney />,
      title: "Income Delete",
      message: "Are you sure want to delete this income?"
    }

    confirmAlert({
      customUI: ({ onClose}) => {
        return (
          <ConfirmBox data={data} onClose={onClose} onYes={() => deleteIncome({id})} onNo={() => console.log("NO")} />
        );
      }
    });
  };

  const deleteIncome = ({ id } : any) => {
    
    fetch("/api/finance/income/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id
      }),
    }).then(async (res) => {
      if (res.status === 200) {
        searchIncome();
        setCurrentIndex(-1);
        toast.success("Delete income information successfully.");
      } else {
        toast.error(await res.text());
      }
    });
  }


  return (
    <>
      <div className={``}>
        <div className="text-lg flex items-center gap-x-4 cursor-pointer rounded-md">
          <span className='text-3xl block float-left'><GiReceiveMoney /></span>
          <h1>INCOME</h1>
        </div>

        <hr className="border-1 border-gray-500 drop-shadow-xl mt-1 mb-2" />

        <div className="flex justify-between xl:w-full">
          <div className="flex justify-center">
            <div className="relative flex rounded-md items-stretch w-auto">
              <input type="hidden" id="search-status" />

              <input type="search" className="relative inline-flex items-center min-w-0 w-full px-3 py-1 text-sm 
                rounded-l-md border border-r-0 font-normal text-gray-700 bg-white bg-clip-padding border-solid 
                border-gray-300 transition ease-in-out m-0 focus:text-gray-700 focus:bg-white 
                focus:border-gray-400 focus:outline-none" id="keyword"
                placeholder="Search" />

              <select id="search-income-type" className={`relative inline-flex px-3 pr-5
                appearance-none border border-r-0 font-normal text-gray-700 bg-white bg-clip-padding border-solid 
                border-gray-300 text-sm focus:z-10 
                focus:border-gray-300 focus:outline-none `}>
                <option value="">Type</option>
                <option value="PROJECT_CHARGE">Project Charge</option>
                <option value="RESOUCE_TRANSFER">Resource Transfer</option>
                <option value="BANK_INTEREST">Bank Interest</option>
                <option value="INVESTMENT">Investment</option>
                <option value="OTHERS">Others</option>
              </select>

              <select id="search-income-projects" className={`relative inline-flex px-3 pr-5
                appearance-none border border-r-0 font-normal text-gray-700 bg-white bg-clip-padding border-solid 
                border-gray-300 text-sm focus:z-10 
                focus:border-gray-300 focus:outline-none `}>
                <option value="">Project</option>
                {
                  projects != null && projects.length > 0 ? (
                    projects.map((project: any, index) => {
                      return (
                        <option key={"project-" + index} value={project.id}>{project.name}</option>
                      )
                    })
                  ) : (<></>)
                }
              </select>

              <button className="btn px-2.5 py-2 font-medium text-base leading-tight uppercase
                rounded-r-md hover:bg-gray-500 hover:text-white border border-gray-300 bg-white
                flex items-center" type="button" onClick={() => searchIncome()}>
                <FiSearch />
              </button>
            </div>
              
            <button className="ml-2 btn px-2 py-2 font-medium text-base leading-tight uppercase 
              rounded-md  hover:bg-gray-700 hover:text-white border border-gray-300 bg-white
              flex items-center" type="button" onClick={() => {
                $("#keyword").val(""); 
                $("#search-income-type").val(""); 
                $("#search-income-projects").val(""); 
                searchIncome();
              }}>
              <MdOutlineClear />
            </button>
          </div>

          <div>
            <button className={`ml-2 inline-flex items-center px-5 py-2 text-white text-sm font-medium rounded-md 
              ${isIncomeCreate ? "bg-gray-600 hover:bg-gray-500" : "bg-dark-blue hover:bg-indigo-600"} `}  
              type="button"
              onClick={() => {setIncomeCreate(!isIncomeCreate)}}>
              {
                (isIncomeCreate) ? (
                  <>
                    <MdCancel />&nbsp; Cancel
                  </>
                ) : (
                  <>
                    <BsPlusCircleFill />&nbsp; New Income
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

                  <div className={`${(isIncomeCreate) ? "block" : "hidden"} mt-3 mb-5`}>
                    <form className={``} onSubmit={formikAdd.handleSubmit}>
                      <div className="flex relative">
                        <span className="input-label px-4 inline-flex items-center border border-r-0 border-gray-200 
                          bg-gray-50 text-gray-500">
                          Type
                        </span>
                        <div className="w-full relative">
                          <select id="income-types" className="appearance-none py-1 px-3 pr-11 block w-full border 
                              border-gray-200 focus:z-10 focus:border-gray-300 focus:outline-none" 
                              name="type"
                              onChange={formikAdd.handleChange}
                              onBlur={formikAdd.handleBlur} >
                            <option value="PROJECT_CHARGE">Project Charge</option>
                            <option value="RESOUCE_TRANSFER">Resource Transfer</option>
                            <option value="BANK_INTEREST">Bank Interest</option>
                            <option value="INVESTMENT">Investment</option>
                            <option value="OTHERS">Others</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                            </svg>
                          </div>
                        </div>
                        <span className="input-label px-4 inline-flex items-center border border-l-0 border-gray-200 
                          bg-gray-50 text-gray-500">
                          Date
                        </span>
                        <div className="w-[150px] relative flex-none grow-0">
                          <Calendar
                            id="income-date" 
                            className={`group-calendar-picker group-cell-calendar-picker border border-l-0 
                              border-gray-200`}
                            dateFormat="yy-mm-dd"
                            name='incomeDate'
                            value={formikAdd.values.incomeDate}
                            onChange={formikAdd.handleChange}
                          />
                        </div>
                      </div>

                      <div className="flex">
                        <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 
                          border-gray-200 bg-gray-50 text-gray-500">
                          Amount
                        </span>
                        <div className="w-full relative">
                          <input type="text" className={`py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 
                            focus:z-10 focus:border-gray-300 focus:outline-none
                            ${formikAdd.errors.detail && "error-validate"}`}
                            name="amount"
                            onChange={formikAdd.handleChange}
                            onBlur={formikAdd.handleBlur} 
                            placeholder={formikAdd.errors.amount && formikAdd.errors.amount} />
                        </div>
                        <span className="input-label px-4 inline-flex items-center border border-l-0 border-t-0 
                          border-gray-200 bg-gray-50 text-gray-500">
                          Currency
                        </span>
                        <div className="w-[150px] relative flex-none grow-0">
                          <FormikProvider value={formikAdd}>
                            <Field
                              as="select"
                              name="currency"
                              className="appearance-none py-1 px-3 pr-11 block w-full text-right 
                              border border-t-0 border-l-0 border-gray-200 focus:z-10 focus:border-gray-300 
                              focus:outline-none"
                            >
                              <option value="VND" selected>VND</option>
                              <option value="JPY">JPY</option>
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                            </Field>
                          </FormikProvider>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 
                            text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="flex">
                        <span className="input-label px-4 inline-flex items-center border border-t-0 border-r-0 
                          border-gray-200 bg-gray-50 text-gray-500">
                          Purpose
                        </span>
                        <div className="w-full relative">
                          <input type="text" className={`py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 
                            focus:z-10 focus:border-gray-300 focus:outline-none 
                            ${formikAdd.errors.detail && "error-validate"}`} 
                            name="detail"
                            onChange={formikAdd.handleChange}
                            onBlur={formikAdd.handleBlur} placeholder={formikAdd.errors.detail && formikAdd.errors.detail} />
                        </div>
                        <span className="input-label px-4 inline-flex items-center border border-l-0 border-t-0 
                          border-gray-200 bg-gray-50 text-gray-500 grow-0">
                          Reference
                        </span>
                        <div className="w-[150px] relative flex-none grow-0">
                          <select id="project-ids" className={`appearance-none py-1 px-3 pr-11 block w-full text-right 
                            border border-t-0 border-l-0 border-gray-200 focus:z-10 focus:border-gray-300 
                            focus:outline-none`} 
                            name="referenceId"
                            onChange={formikAdd.handleChange}
                            onBlur={formikAdd.handleBlur}>
                            <option value="">&nbsp;</option>
                            {
                              projects != null && projects.length > 0 ? (
                                projects.map((project: any, index) => {
                                  return (
                                    <option key={"project-a-" + index} value={project.id}>{project.name}</option>
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

                      <div>
                        <button className="m-0 w-full items-center py-1 bg-green-600 hover:bg-green-500 
                          text-center text-white text-sm font-medium" type="submit">
                          <MdSaveAlt className='inline-block' />&nbsp;
                          Save
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
                              <label htmlFor="checkbox-all" className="sr-only">Choose</label>
                            </div>
                          </th>
                          <th scope="col" className="w-[50px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            No
                          </th>
                          <th scope="col" className="w-[90px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Date
                          </th>
                          <th scope="col" className="w-[130px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Type
                          </th>
                          <th scope="col" className="w-[120px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Amount
                          </th>
                          <th scope="col" className="w-[90px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Amount (VND)
                          </th>
                          <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Detail
                          </th>
                          <th scope="col" className="w-[80px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            PIC
                          </th>
                          <th scope="col" className="w-[90px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Reference
                          </th>
                          <th scope="col" className="w-[130px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Update Date
                          </th>
                          <th scope="col" className="w-[60px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody className="bg-white">
                        {
                          incomes != null && incomes.length > 0 ? (
                            incomes.map((income: any, index) => {
                              
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

                                  <td className="p-2 border border-gray-300 text-center">
                                    {(page - 1)*maxResults + index + 1}
                                  </td>

                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`}>
                                    <span className={` ${(index == currentIndex) ? "hidden" : "block"} w-full text-center`}>
                                      {income.incomeDate}
                                    </span>
                                    <Calendar
                                      id="income-date" 
                                      className={` calendar-picker cell-calendar-picker bg-table-input`}
                                      dateFormat="yy-mm-dd"
                                      name='incomeDate'
                                      value={formikUpdate.values.incomeDate}
                                      onChange={formikUpdate.handleChange}
                                      style={(index != currentIndex) ? {display: "none"} : {}}
                                    />
                                  </td>
  
                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm 
                                    font-normal text-gray-900 border border-gray-300`}>
                                    <span className={` ${(index == currentIndex) ? "hidden" : "block"} `}>
                                      {income.type.toLowerCase().replace("_", " ").replace(/(^\w|\s\w)/g, (m:any) => m.toUpperCase())}
                                    </span>
                                    <select id="project-types" className={` ${(index != currentIndex) && "hidden"} 
                                      appearance-none block border border-t-0 border-gray-200 text-sm focus:z-10 
                                      focus:border-gray-300 focus:outline-none bg-table-input w-full`} 
                                      name="type"
                                      value={formikUpdate.values.type}
                                      onChange={formikUpdate.handleChange}
                                      onBlur={formikUpdate.handleBlur}>
                                      <option value="PROJECT_CHARGE">Project Charge</option>
                                      <option value="RESOUCE_TRANSFER">Resource Transfer</option>
                                      <option value="BANK_INTEREST">Bank Interest</option>
                                      <option value="INVESTMENT">Investment</option>
                                      <option value="OTHERS">Others</option>
                                    </select>
                                  </td>

                                  <td className={`p-2 text-sm font-normal 
                                    text-gray-900 border border-gray-300`}>
                                    <span className={`block text-right`}>
                                      {income.amountAll.toLocaleString("en-US")}
                                    </span>
                                  </td>

                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`}>
                                    <span className={` ${(index == currentIndex) ? "hidden" : "block"} text-right`}>
                                      {income.amount.toLocaleString("en-US")} ₫
                                    </span>
                                    <input type="text" className={` ${(index != currentIndex) && "hidden"} 
                                      py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 
                                      focus:border-gray-300 focus:outline-none bg-table-input text-right
                                      ${formikUpdate.errors.amount && "error-validate"}`} 
                                      name="amount"
                                      value={formikUpdate.values.amount}
                                      onChange={formikUpdate.handleChange}
                                      onBlur={formikUpdate.handleBlur} 
                                      placeholder={formikUpdate.errors.amount && formikUpdate.errors.amount}  />
                                  </td>
  
                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`}>
                                    <span className={` ${(index == currentIndex) && "hidden"}`}>
                                      {income.detail}
                                    </span>
                                    <input type="text" className={` ${(index != currentIndex) && "hidden"} 
                                      py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 
                                      focus:border-gray-300 focus:outline-none bg-table-input 
                                      ${formikUpdate.errors.detail && "error-validate"}`} 
                                      name="detail"
                                      value={formikUpdate.values.detail}
                                      onChange={formikUpdate.handleChange}
                                      onBlur={formikUpdate.handleBlur} 
                                      placeholder={formikUpdate.errors.detail && formikUpdate.errors.detail}  />
                                  </td>
  
                                  <td className={`text-sm font-normal text-gray-900 border border-gray-300`}>
                                    <span className={`block w-full text-center`}>{income.createBy}</span>
                                  </td>
  
                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-500 text-center border border-gray-300`}>
                                    <span className={` ${(index == currentIndex) && "hidden"}`}>{income.referenceCode}</span>
                                    <select id="project-ids" className={` ${(index != currentIndex) && "hidden"} 
                                      appearance-none block border border-t-0 border-gray-200 text-sm focus:z-10 
                                      focus:border-gray-300 focus:outline-none bg-table-input w-full`} 
                                      name="referenceId"
                                      value={formikUpdate.values.referenceId}
                                      onChange={formikUpdate.handleChange}
                                      onBlur={formikUpdate.handleBlur}>
                                      <option value="">&nbsp;</option>
                                      {
                                        projects != null && projects.length > 0 ? (
                                          projects.map((project: any, index) => {
                                            return (
                                              <option key={"project-b-" + index} value={project.id}>{project.code}</option>
                                            )
                                          })
                                        ) : (<></>)
                                      }
                                    </select>
                                  </td>

                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`}>
                                    <span className={`w-full text-center`}>
                                      {income.processDate}
                                    </span>
                                  </td>

                                  <td className="p-2 text-sm font-normal text-center border border-gray-300">
                                    {
                                      index == currentIndex ? (
                                        <>
                                          <a href="#" className="text-base text-blue-600 hover:underline mr-2" 
                                            onClick={() => { 
                                              $('#btn-update-income').click(); 
                                              return false;
                                            } } >
                                              <FaSave />
                                          </a>
                                          <button id="btn-update-income" className="hidden items-center px-3 
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
                                          <a href="#" className="text-base text-blue-600 hover:underline mr-1" 
                                            onClick={() => {
                                              setIncome({
                                                id: income.id,
                                                incomeDate: moment(income.incomeDate, "YYYY-MM-DD").toDate(),
                                                type: income.type,
                                                amount: income.amount,
                                                currency: income.currency,
                                                detail: income.detail,
                                                requestBy: income.requestBy,
                                                referenceId: income.referenceId,
                                                processDate: moment(income.processDate, "YYYY-MM-DD").toDate(),
                                              });
                                              setCurrentIndex(index);
                                            }}>
                                              <RiFileEditFill />
                                          </a>
                                          <a href="#" className="text-base text-red-600 hover:underline" 
                                            onClick={() => { confirmIncome(income.id) }}>
                                            <RiDeleteBin2Fill />
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
                              <td colSpan={11} className="p-2 text-sm font-normal text-center border border-gray-300">
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
  );
}
