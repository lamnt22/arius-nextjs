"use client"

import React, { ChangeEvent, useCallback, useEffect, useState, useRef } from 'react'

import $ from "jquery"
import { useFormik } from 'formik';
import * as yup from 'yup';

import Pagination from "react-js-pagination";

import moment from "moment-timezone";

import toast from "react-hot-toast";

import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

import { FaInfoCircle } from "react-icons/fa"
import { FiSearch, FiSend } from "react-icons/fi"
import { MdOutlineClear, MdCancel, MdOutlineCancel, MdOutlineCheckCircle } from "react-icons/md"
import { RiFileEditFill, RiDeleteBin2Fill, RiFileExcelLine, RiCheckDoubleLine } from "react-icons/ri"
import { BsPlusCircleFill, BsUpload } from "react-icons/bs"
import { FaSave } from "react-icons/fa"
import { GiExpense } from "react-icons/gi"
import { AiOutlineMore } from "react-icons/ai"

import ConfirmBox from "../../../components/confirm"

import "primereact/resources/themes/lara-light-indigo/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";                                //icons

import { Calendar } from 'primereact/calendar';
import Modal from 'react-modal';
import { AiFillSave } from 'react-icons/ai';
import LoadingDots from '@/components/loading-dots';
import { useDropzone } from 'react-dropzone';

import { promises as fs } from "fs";
import { join } from 'path'

const initialExpense = {
  requestDate: new Date(),
  deadline: new Date(),
  type: '',
  amount: '',
  currency: '',
  detail: '',
  requestBy: '',
  status: '',
  processDate: new Date(),
  fromDate: new Date(),
  toDate: new Date(),
}

const typeMoney = new Map();
typeMoney.set('JPY', '¥');
typeMoney.set('USD', '$');
typeMoney.set('EUR', '€');

export default function Expense(props: any) {

  console.log("props: ", props);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  const [maxResults, setMaxResults] = useState(10);

  const handlePagination = async (page:any) => {
    setPage(page);
  }

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [isExpenseRequest, setExpenseRequest] = useState(false);

  const formikAdd = useFormik({
    initialValues: initialExpense,

    onSubmit: (target: any) => {
      let deadline = moment.utc(target.deadline).tz("Asia/Ho_Chi_Minh").format().replace("+07:00", "Z");

      if (target.type == "") {
        target.type = "OTHERS";
      }
      if (target.currency == "") {
        target.currency = "VND";
      }
      if (target.status == "") {
        target.status = "WAITING"
      }
  
      const formData = new FormData();
      
      formData.append("requestDate", deadline);
      formData.append("deadline", deadline);
      formData.append("type", target.type);
      formData.append("amount", target.amount);
      formData.append("currency", target.currency);
      formData.append("detail", target.detail);
      formData.append("email", props?.params?.loginUserEmail);
      formData.append("status", target.status);

      if (uploadFiles && uploadFiles.length > 0) {
        uploadFiles.forEach((file, i) => {
          formData.append(`file-${i}`, file, file.name);
        });
      }

      fetch("/api/finance/expense/add", {
        method: "POST",
        body: formData
      }).then(async (res) => {
        setLoading(false);
        if (res.status === 200) {
          searchExpense();
          setMessage("");
          toast.success("Send expense request successfully.");
          setExpenseRequest(false);
        } else {
          toast.error(await res.text());
        }
      });
    },

    validationSchema: yup.object({
      amount: yup.string().trim().required('Required'),
      detail: yup.string().trim().required('Required'),
    }),
  });


  const [ currentIndex, setCurrentIndex ] = useState(-1);
  const [ isDetailUpdate, setDetailUpdate ] = useState(false);

  const [ expense, setExpense ] = useState({
    id: '',
    requestDate: new Date(),
    deadline: new Date(),
    type: '',
    amount: '',
    currency: '',
    detail: '',
    requestBy: '',
    status: '',
    description: '',
    processDate: new Date(),
  });

  const formikUpdate = useFormik({
    initialValues: expense,
    enableReinitialize: true,

    onSubmit: (target: any) => {
      let requestDate = moment.utc(target.requestDate).tz("Asia/Ho_Chi_Minh").format().replace("+07:00", "Z");
      let deadline = moment.utc(target.deadline).tz("Asia/Ho_Chi_Minh").format().replace("+07:00", "Z");
      console.log("isDetailUpdate: ", isDetailUpdate);
      if (isDetailUpdate && (target.status == "REJECTED" || target.status == "PENDING")) {
        console.log("target.description.toString().trim(): ", target.description.toString().trim());
        if (target.description.toString().trim() == '') {
          toast.error("Message invalid.");
          return;
        }
      }

      fetch("/api/finance/expense/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: target.id,
          type: target.type,
          requestDate: requestDate,
          deadline: deadline,
          amount: target.amount,
          currency: target.currency,
          detail: target.detail,
          status: target.status,
          description: target.description,
          email: props?.params?.loginUserEmail,
        }),
      }).then(async (res) => {
        if (res.status === 200) {
          searchExpense();
          setCurrentIndex(-1);
          toast.success("Update expense information successfully.");
        } else {
          toast.error(await res.text());
          setExpense(target);
        }
      });
    },

    validationSchema: yup.object({
      amount: yup.string().trim().required('Required'),
      detail: yup.string().trim().required('Required'),
    }),
  });

  const [isOpen, setIsOpen] = React.useState(false)
  const customModalDESC = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)'
    },
    content: {
      width: '540px',
      overflow: 'hidden',
      top: '20%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)'
    }
  }
  const rejectStatus = (expense: any) => {
    setIsOpen(true);
    setExpense(expense);
  }

  const updateRejected = (status: any) => {
    let requestDate = moment.utc(expense.requestDate).tz("Asia/Ho_Chi_Minh").format().replace("+07:00", "Z");
    let deadline = moment.utc(expense.deadline).tz("Asia/Ho_Chi_Minh").format().replace("+07:00", "Z");
    let description = $('#reject-description').val();
    if (description?.toString().trim() == '') {
      toast.error("Message invalid.");
      return;
    }
    fetch("/api/finance/expense/edit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: expense.id,
        type: expense.type,
        requestDate: requestDate,
        deadline: deadline,
        amount: expense.amount,
        currency: expense.currency,
        detail: expense.detail,
        status: status,
        description: description,
        email: props?.params?.loginUserEmail,
      }),
    }).then(async (res) => {
      if (res.status === 200) {
        searchExpense();
        setCurrentIndex(-1);
        toast.success("Update status rejected successfully.");
        setIsOpen(false);
      } else {
        toast.error(await res.text());
        setExpense(expense);
      }
    });
  }

  const updateApproved = (expense: any) => {
    let requestDate = moment.utc(expense.requestDate).tz("Asia/Ho_Chi_Minh").format().replace("+07:00", "Z");
    let deadline = moment.utc(expense.deadline).tz("Asia/Ho_Chi_Minh").format().replace("+07:00", "Z");

    fetch("/api/finance/expense/edit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: expense.id,
        type: expense.type,
        requestDate: requestDate,
        deadline: deadline,
        amount: expense.amount,
        currency: expense.currency,
        detail: expense.detail,
        status: "APPROVED",
        description: null,
        email: props?.params?.loginUserEmail,
      }),
    }).then(async (res) => {
      if (res.status === 200) {
        searchExpense();
        setCurrentIndex(-1);
        toast.success("Update status approved successfully.");
        setIsOpen(false);
      } else {
        toast.error(await res.text());
        setExpense(expense);
      }
    });
  }

  function objToQueryString(obj: any) {
    const keyValuePairs = [];
    for (const key in obj) {
      keyValuePairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
    }
    return keyValuePairs.join('&');
  }


  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [expenses, setExpenses] = useState([]);
  const [listFile, setListFile] = useState([]); 

  const searchExpense = async () => {

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
          fromDate: fromDate,
          toDate: toDate,
          type: $("#search-expense-type").val(),
          status: $("#search-expense-status").val(),
          page: page,
        });
        fetch(`/api/finance/expense/list?${queryString}`, { 
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        }).then(async (res: any) => {
          let data = await res.json();
    
          setTotal(data.total);
          setMaxResults(data.maxResults);

          const expenseList: any = [];

          for(let i = 0; i < data.expenses.length; i++) {
            let e: any = data.expenses[i];

            let tiente = e.currency;

            let numberDefault = currencyMap.get(tiente);

            if (numberDefault) {
              let type = typeMoney.get(tiente);
              let amountAll1 = Math.round(e.amount / numberDefault);
              let amountAll = amountAll1.toLocaleString("en-US") + ' ' + type;
              e = { ...e, "amountAll": amountAll };
            } else {
              let amountAll1 = e.amount;
              let amountAll = e.amountAll1.toLocaleString("en-US") + ' ₫';
              e = { ...e, "amountAll": amountAll };
            }

            expenseList.push(e);
          }
 
          setExpenses(expenseList);
        });
      });

    
  };


  // Init search
  useEffect(() => {
    searchExpense();
  }, [page]);


  const confirmExpense = async (id: any) => {

    const data = {
      icon: <GiExpense />,
      title: "Expense Delete",
      message: "Are you sure want to delete this expense?"
    }

    confirmAlert({
      customUI: ({ onClose}) => {
        return (
          <ConfirmBox data={data} onClose={onClose} onYes={() => deleteExpense({id})} onNo={() => console.log("NO")} />
        );
      }
    });
  };

  const deleteExpense = ({ id } : any) => {
    
    fetch("/api/finance/expense/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id
      }),
    }).then(async (res) => {
      if (res.status === 200) {
        searchExpense();
        setCurrentIndex(-1);
        toast.success("Delete expense information successfully.");
      } else {
        toast.error(await res.text());
      }
    });
  }

  const [isOpenDetail, setIsOpenDetail] = React.useState(false)
  const customModalDetalStyles = {
      overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)'
      },
      content: {
        width: '800px',
        overflow: 'hidden',
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
      }
  }

  
  const getFilesDetailExpense = (expenseId: any) => {
    const queryString = objToQueryString({
      expenseId: expenseId,
    });
    fetch(`/api/finance/expense/listFile?${queryString}`, { 
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(async (res: any) => {
      let data = await res.json();
      let lFile: any = [];
      for (var i = 0; i < data.files.length; i++) {
        let f = data.files[i].file.split("/")
        lFile.push(f[4])
      }
      setListFile(lFile);
      setIsOpenDetail(true);
    });
  };

  const [uploadFiles, setUploadFiles] = useState<any[]>([])
  
  const onDrop = useCallback((acceptedFiles: any) => {
    let files = uploadFiles.concat(acceptedFiles);
    setUploadFiles(files);

  }, [uploadFiles])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
  });

  const files = uploadFiles.map((file: any, index) => (
    <li key={index} className={`flex justify-stretch text-sm border border-t-0 border-b-0 border-r-0 border-gray-200 
        rounded-sm w-full px-3 pt-1`}>
      <span className='inline-flex items-center w-full'>
        {file.path} （サイズ：{Math.round(file.size / 1000).toLocaleString("en-US")}KB）
      </span>
      <button className="w-[40px] inline-flex items-center px-3 py-1 bg-red-600 hover:opacity-90 text-white 
        text-sm font-medium rounded-sm" type="button" onClick={() => {
          const result = uploadFiles.filter((item: any, index: any) => item.name != file.name);
          setUploadFiles(result);
        }}>
        <RiDeleteBin2Fill />
      </button>
    </li>

  ));

  const handleUploadClick = async (event: any) => {

    if (!uploadFiles || uploadFiles.length <= 0) {
      return;
    }

    const data = new FormData();
    uploadFiles.forEach((file, i) => {
      data.append(`file-${i}`, file, file.name);
    });

    const response = await fetch("/api/finance/expense/upload", {
      method: "POST",
      body: data
    })
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => console.error(err));
  };

  return (
    <>
      <div className={``}>
        <div className="text-lg flex items-center gap-x-4 cursor-pointer rounded-md">
          <span className='text-3xl block float-left'><GiExpense /></span>
          <h1>EXPENSES</h1>
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

              <div className="w-[130px] flex-none relative">
                <Calendar
                  id="from-date" placeholder='From' showIcon showButtonBar
                  className={`calendar-picker cell-calendar-picker search-calendar-picker border border-r-0
                    border-gray-300`}
                  dateFormat="yy-mm-dd"
                  value={fromDate}
                  onChange={(e:any) => setFromDate(e.value)}
                />
              </div>
              <div className="w-[100px] flex-none relative">
                <Calendar
                  id="to-date" placeholder='To'
                  className={`calendar-picker cell-calendar-picker search-calendar-picker border border-r-0
                    border-gray-300`}
                  dateFormat="yy-mm-dd"
                  value={toDate}
                  onChange={(e:any) => setToDate(e.value)}
                />
              </div>

              <select id="search-expense-type" className={`relative inline-flex px-3 pr-5
                appearance-none border border-r-0 font-normal text-gray-700 bg-white bg-clip-padding border-solid 
                border-gray-300 text-sm focus:z-10 
                focus:border-gray-300 focus:outline-none `}>
                <option value="">Type</option>
                <option value="LAW_FEE">Law Fee</option>
                <option value="OFFICE_RENT">Office Rent</option>
                <option value="OFFICE_EQUIPMENT">Office Equipment</option>
                <option value="OFFICE_SERVICE">Office Service</option>
                <option value="BANK_FEE">Bank Fee</option>
                <option value="SALARY">Salary</option>
                <option value="SALARY_13TH">Salary 13&#x1D57;&#x02B0;</option>
                <option value="BONUS">Bonus</option>
                <option value="INSURANCE">Insurance</option>
                <option value="BUSINESS">Business</option>
                <option value="TRAINING">Training</option>
                <option value="TRAVEL">Travel</option>
                <option value="TEAM_BUILDING">Team Building</option>
                <option value="OUT_SOURCE">Out Source</option>
                <option value="INVESTMENT">Investment</option>
                <option value="OTHERS">Others</option>
              </select>

              <select id="search-expense-status" className={`relative inline-flex px-3 pr-5
                appearance-none border border-r-0 font-normal text-gray-700 bg-white bg-clip-padding border-solid 
                border-gray-300 text-sm focus:z-10 
                focus:border-gray-300 focus:outline-none `}>
                <option value="">Status</option>
                <option value="WAITING">WAITING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="PENDING">PENDING</option>
                <option value="CANCEL">CANCEL</option>
              </select>

              <button className="btn px-2.5 py-2 font-medium text-base leading-tight uppercase
                rounded-r-md hover:bg-gray-500 hover:text-white border border-gray-300 bg-white
                flex items-center" type="button" onClick={() => searchExpense()}>
                <FiSearch />
              </button>
            </div>
              
            <button className="ml-2 btn px-2 py-2 font-medium text-base leading-tight uppercase 
              rounded-md  hover:bg-gray-700 hover:text-white border border-gray-300 bg-white
              flex items-center" type="button" onClick={() => {
                $("#keyword").val(""); 
                $("#search-expense-type").val(""); 
                $("#search-expense-status").val(""); 
                searchExpense();
              }}>
              <MdOutlineClear />
            </button>
          </div>

          <div>
            <button className={`ml-2 inline-flex items-center px-5 py-2 text-white text-sm font-medium rounded-md 
              ${isExpenseRequest ? "bg-gray-600 hover:bg-gray-500" : "bg-dark-blue hover:bg-indigo-600"} `}  
              type="button"
              onClick={() => {setExpenseRequest(!isExpenseRequest); formikAdd.setValues(initialExpense); setUploadFiles([])}}>
              {
                (isExpenseRequest) ? (
                  <>
                    <MdCancel />&nbsp; Cancel
                  </>
                ) : (
                  <>
                    <BsPlusCircleFill/>&nbsp; Expense Request
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

                  <div className={`${(isExpenseRequest) ? "block" : "hidden"} mt-3 mb-5`}>
                    <form className={``} onSubmit={formikAdd.handleSubmit}>
                      <div className="flex relative">
                        <span className="input-label px-4 inline-flex items-center border border-r-0 border-gray-200 
                          bg-gray-50 text-gray-500">
                          Type
                        </span>
                        <div className="w-full relative">
                          <select id="expense-types" className="appearance-none py-1 px-3 pr-11 block w-full border 
                              border-gray-200 focus:z-10 focus:border-gray-300 focus:outline-none" 
                              name="type"
                              onChange={formikAdd.handleChange}
                              onBlur={formikAdd.handleBlur} >
                            <option value="LAW_FEE">Law Fee</option>
                            <option value="OFFICE_RENT">Office Rent</option>
                            <option value="OFFICE_EQUIPMENT">Office Equipment</option>
                            <option value="OFFICE_SERVICE">Office Service</option>
                            <option value="BANK_FEE">Bank Fee</option>
                            <option value="SALARY">Salary</option>
                            <option value="SALARY_13TH">Salary 13&#x1D57;&#x02B0;</option>
                            <option value="BONUS">Bonus</option>
                            <option value="INSURANCE">Insurance</option>
                            <option value="BUSINESS">Business</option>
                            <option value="TRAINING">Training</option>
                            <option value="TRAVEL">Travel</option>
                            <option value="TEAM_BUILDING">Team Building</option>
                            <option value="OUT_SOURCE">Out Source</option>
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
                          Deadline
                        </span>
                        <div className="w-[150px] relative">
                          <Calendar
                            id="deadline" 
                            className={`group-calendar-picker group-cell-calendar-picker border border-l-0 
                              border-gray-200`}
                            dateFormat="yy-mm-dd"
                            name='deadline'
                            value={formikAdd.values.deadline}
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
                            value={formikAdd.values.amount}
                            placeholder={formikAdd.errors.amount && formikAdd.errors.amount} />
                        </div>
                        <span className="input-label px-4 inline-flex items-center border border-l-0 border-t-0 
                          border-gray-200 bg-gray-50 text-gray-500">
                          Currency
                        </span>
                        <div className="w-[150px] relative">
                          <select id="currencies" className="appearance-none py-1 px-3 pr-11 block w-full text-right 
                            border border-t-0 border-l-0 border-gray-200 focus:z-10 focus:border-gray-300 
                            focus:outline-none" 
                              name="currency"
                              onChange={formikAdd.handleChange}
                              onBlur={formikAdd.handleBlur} >
                            <option value="VND">VND</option>
                            <option value="JPY">JPY</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                          </select>
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
                            value={formikAdd.values.detail}
                            onBlur={formikAdd.handleBlur} placeholder={formikAdd.errors.detail && formikAdd.errors.detail}  />
                        </div>
                        <span className="input-label px-4 inline-flex items-center border border-l-0 border-t-0 
                          border-gray-200 bg-gray-50 text-gray-500">
                          Status
                        </span>
                        <div className="w-[150px] relative">
                          <select id="currencies" className="appearance-none py-1 px-3 pr-11 block w-full text-right 
                            border border-t-0 border-l-0 border-gray-200 focus:z-10 focus:border-gray-300 
                            focus:outline-none" 
                              name="status"
                              onChange={formikAdd.handleChange}
                              onBlur={formikAdd.handleBlur} >
                            <option value="WAITING">WAITING</option>
                            <option value="APPROVED">APPROVED</option>
                            <option value="REJECTED">REJECTED</option>
                            <option value="PENDING">PENDING</option>
                            <option value="CANCEL">CANCEL</option>
                          </select>
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
                          Documents
                        </span>

                        <div className="w-full relative" {...getRootProps()}>
                          <input {...getInputProps()} />
                          <p  className={`py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 focus:z-10 
                            focus:border-gray-300 focus:outline-none text-gray-500`}>Drop or select files</p>
                        </div>
                      </div>

                      {
                        (files != null && files.length > 0) ?
                          <div className="flex">
                            <span className="input-label px-4 inline-flex items-center border border-t-0 border-r-0 
                              border-gray-200 bg-gray-50 text-gray-500">
                              Upload files
                            </span>

                            <div className="flex items-center justify-stretch w-full relative border border-l-0 border-t-0 
                            border-gray-200">
                              <ul className='w-full pb-1'>
                                {files}
                              </ul>
                            </div>
                          </div>
                          : 
                          <></>
                      }

                        

                      <div>
                        <button className="m-0 w-full items-center py-1 bg-green-600 hover:bg-green-500 
                          text-center text-white text-sm font-medium" type="submit">
                          <FiSend className='inline-block' />&nbsp;
                          Send
                        </button>
                      </div>
                    </form>


                    <button
                          className="btn btn-primary"
                          type="submit"
                          onClick={handleUploadClick}
                        >
                          Send to server
                        </button>
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
                          <th scope="col" className="w-[90px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Deadline
                          </th>
                          <th scope="col" className="w-[130px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Type
                          </th>
                          <th scope="col" className="w-[90px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Amount
                          </th>
                          <th scope="col" className="w-[120px] p-2 border border-gray-300 bg-light-blue text-white 
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
                            Status
                          </th>
                          <th scope="col" className="w-[130px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Update Date
                          </th>
                          <th scope="col" className="w-[130px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody className="bg-white">
                        {
                          expenses != null && expenses.length > 0 ? (
                            expenses.map((expense: any, index) => {
                              
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
                                      {expense.requestDate}
                                    </span>
                                    <Calendar
                                      id="requestDate" 
                                      className={` calendar-picker cell-calendar-picker bg-table-input`}
                                      dateFormat="yy-mm-dd"
                                      name='requestDate'
                                      value={formikUpdate.values.requestDate}
                                      onChange={formikUpdate.handleChange}
                                      style={(index != currentIndex) ? {display: "none"} : {}}
                                    />
                                  </td>

                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`}>
                                    <span className={` ${(index == currentIndex) ? "hidden" : "block"} w-full text-center`}>
                                      {expense.deadline}
                                    </span>
                                    <Calendar
                                      id="deadline" 
                                      className={` calendar-picker cell-calendar-picker bg-table-input`}
                                      dateFormat="yy-mm-dd"
                                      name='deadline'
                                      value={formikUpdate.values.deadline}
                                      onChange={formikUpdate.handleChange}
                                      style={(index != currentIndex) ? {display: "none"} : {}}
                                    />
                                  </td>
  
                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm 
                                    font-normal text-gray-900 border border-gray-300`}>
                                    <span className={` ${(index == currentIndex) ? "hidden" : "block"} `}>
                                      {expense.type.toLowerCase().replace("_", " ").replace(/(^\w|\s\w)/g, (m:any) => m.toUpperCase())}
                                    </span>
                                    <select id="project-types" className={` ${(index != currentIndex) && "hidden"} 
                                      appearance-none block border border-t-0 border-gray-200 text-sm focus:z-10 
                                      focus:border-gray-300 focus:outline-none bg-table-input w-full`} 
                                      name="type"
                                      value={formikUpdate.values.type}
                                      onChange={formikUpdate.handleChange}
                                      onBlur={formikUpdate.handleBlur}>
                                      <option value="">Type</option>
                                      <option value="SALARY">Salary</option>
                                      <option value="SALARY_13TH">Salary 13th</option>
                                      <option value="BONUS">Bonus</option>
                                      <option value="TEAM_BUILDING">Team Building</option>
                                      <option value="EQUIPMENT">Equipment</option>
                                      <option value="OFFICE">Office</option>
                                      <option value="OTHERS">Others</option>
                                    </select>
                                  </td>

                                  <td className={`p-2 text-sm font-normal 
                                    text-gray-900 border border-gray-300`}>
                                    <span className={`block text-right`}>
                                      {expense.amountAll}
                                    </span>
                                  </td>
  
                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`}>
                                    <span className={` ${(index == currentIndex) ? "hidden" : "block"} text-right`}>
                                      {expense.amount.toLocaleString("en-US")} ₫
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
                                      {expense.detail}
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
                                    <span className={`block w-full text-center`}>{expense.requestBy}</span>
                                  </td>
                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm 
                                    font-normal text-center text-gray-900 border border-gray-300`}>
                                    <span className={` ${(index == currentIndex) ? "hidden" : "block"} text-center`}>
                                      {expense.status.toLowerCase().replace("_", " ").replace(/(^\w|\s\w)/g, (m:any) => m.toUpperCase())}
                                    </span>
                                    <select id="project-statuses" className={` ${(index != currentIndex) && "hidden"} 
                                      appearance-none block border border-t-0 border-gray-200 text-sm focus:z-10 
                                      focus:border-gray-300 focus:outline-none bg-table-input w-full`} 
                                      name="status"
                                      value={formikUpdate.values.status}
                                      onChange={formikUpdate.handleChange}
                                      onBlur={formikUpdate.handleBlur}>
                                      <option value="WAITING">Waiting</option>
                                      <option value="APPROVED">AppRoved</option>
                                      <option value="REJECTED">Rejected</option>
                                      <option value="PENDING">Pending</option>
                                      <option value="CANCEL">Cancel</option>
                                    </select>
                                  </td>

                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`}>
                                    <span className={`w-full text-center`}>
                                      {expense.processDate}
                                    </span>
                                  </td>

                                  <td className="text-sm font-normal text-center border border-gray-300">
                                    {
                                      index == currentIndex ? (
                                        <>
                                          <a href="#" className="text-base text-blue-600 hover:underline mr-2" 
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
                                          <a href="#" className="text-base text-blue-600 hover:underline mr-1" 
                                            onClick={() => {
                                              setDetailUpdate(false)
                                              setExpense({
                                                id: expense.id,
                                                requestDate: moment(expense.requestDate, "YYYY-MM-DD").toDate(),
                                                deadline: moment(expense.deadline, "YYYY-MM-DD").toDate(),
                                                type: expense.type,
                                                amount: expense.amount,
                                                currency: expense.currency,
                                                detail: expense.detail,
                                                requestBy: expense.requestBy,
                                                status: expense.status,
                                                description: expense.description,
                                                processDate: moment(expense.processDate, "YYYY-MM-DD").toDate(),
                                              });
                                              formikUpdate.setValues({
                                                id: expense.id,
                                                requestDate: moment(expense.requestDate, "YYYY-MM-DD").toDate(),
                                                deadline: moment(expense.deadline, "YYYY-MM-DD").toDate(),
                                                type: expense.type,
                                                amount: expense.amount,
                                                currency: expense.currency,
                                                detail: expense.detail,
                                                requestBy: expense.requestBy,
                                                status: expense.status,
                                                description: expense.description,
                                                processDate: moment(expense.processDate, "YYYY-MM-DD").toDate(),
                                              });
                                              setCurrentIndex(index);
                                            }}>
                                              <RiFileEditFill />
                                          </a>
                                          <a href="#" className="text-base text-red-600 hover:underline mr-1" 
                                            onClick={() => { confirmExpense(expense.id) }}>
                                            <RiDeleteBin2Fill />
                                          </a>
                                          <a href="#" className="text-base text-green-600 hover:underline" 
                                            onClick= {() => { formikUpdate.setValues({
                                              id: expense.id,
                                              requestDate: moment(expense.requestDate, "YYYY-MM-DD").toDate(),
                                              deadline: moment(expense.deadline, "YYYY-MM-DD").toDate(),
                                              type: expense.type,
                                              amount: expense.amount,
                                              currency: expense.currency,
                                              detail: expense.detail,
                                              requestBy: expense.requestBy,
                                              status: expense.status,
                                              description: expense.description,
                                              processDate: moment(expense.processDate, "YYYY-MM-DD").toDate(),
                                            }); getFilesDetailExpense(expense.id); setDetailUpdate(true)}}>
                                            <FaInfoCircle />
                                          </a>
                                          
                                          <AiOutlineMore className='inline-block' />

                                          <a href="#" className="text-base text-blue-600 hover:underline mr-1" 
                                            onClick={() => { rejectStatus(expense) }}>
                                            <MdOutlineCancel />
                                          </a>
                                          <a href="#" className="text-base text-blue-600 hover:underline" 
                                            onClick={() => { updateApproved(expense) }}>
                                            <MdOutlineCheckCircle />
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
                              <td colSpan={12} className="p-2 text-sm font-normal text-center border border-gray-300">
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

        <Modal 
          isOpen={isOpen} 
          ariaHideApp={false} 
          onRequestClose={() => setIsOpen(false)} 
          style={customModalDESC}>

          <div className="text-lg flex items-center gap-x-4 cursor-pointer rounded-md">
            <h1>Reason Reject</h1>
          </div>
          <div className='mt-3'>
            <h3 className="input-label inline-flex items-center mb-1">
              Message
            </h3>
            <div className="flex">
                <textarea id='reject-description' className={`py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 
                  focus:border-gray-300 focus:outline-none`} 
                  name="description" value={expense.description}></textarea>
            </div>
          </div>

          <div className='mt-3 flex justify-between'>
              <button className="inline-flex items-center px-3 py-2 bg-gray-400 hover:bg-gray-600 text-white 
                text-sm font-medium rounded-md" type="button" onClick={() => setIsOpen(false)}>
                <span className='text-xl block float-left mr-2'><MdCancel /></span>
                Cancel
              </button>

              <button className="inline-flex items-center px-3 py-2 bg-arius-green hover:bg-light-green text-white 
                text-sm font-medium rounded-md" type="button" onClick={() => {updateRejected("REJECTED")}}
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
        </Modal>


        <div id="detail">
          <Modal 
            isOpen={isOpenDetail} 
            ariaHideApp={false} 
            onRequestClose={() => setIsOpenDetail(false)} 
            style={customModalDetalStyles}>

            <div className="text-lg flex items-center gap-x-4 cursor-pointer rounded-md mb-2">
              <span className='text-3xl block float-left'><GiExpense /></span>
              <h1>Expense Information</h1>
            </div>

            <form className={``} onSubmit={formikUpdate.handleSubmit}>
              <div className="flex relative">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-gray-200 
                  bg-gray-50 text-gray-500">
                  Type
                </span>
                <div className="w-full relative">
                  <select id="expense-types" className="appearance-none py-1 px-3 pr-11 block w-full border 
                      border-gray-200 focus:z-10 focus:border-gray-300 focus:outline-none" 
                      name="type"
                      value={formikUpdate.values.type}
                      onChange={formikUpdate.handleChange}
                      onBlur={formikUpdate.handleBlur} >
                    <option value="LAW_FEE">Law Fee</option>
                    <option value="OFFICE_RENT">Office Rent</option>
                    <option value="OFFICE_EQUIPMENT">Office Equipment</option>
                    <option value="OFFICE_SERVICE">Office Service</option>
                    <option value="BANK_FEE">Bank Fee</option>
                    <option value="SALARY">Salary</option>
                    <option value="SALARY_13TH">Salary 13&#x1D57;&#x02B0;</option>
                    <option value="BONUS">Bonus</option>
                    <option value="INSURANCE">Insurance</option>
                    <option value="BUSINESS">Business</option>
                    <option value="TRAINING">Training</option>
                    <option value="TRAVEL">Travel</option>
                    <option value="TEAM_BUILDING">Team Building</option>
                    <option value="OUT_SOURCE">Out Source</option>
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
                  Deadline
                </span>
                <div className="w-[300px] relative">
                  <Calendar
                    id="deadline" 
                    className={`group-calendar-picker group-cell-calendar-picker border border-l-0 
                      border-gray-200`}
                    dateFormat="yy-mm-dd"
                    name='deadline'
                    value={formikUpdate.values.deadline}
                    onChange={formikUpdate.handleChange}
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
                    ${formikUpdate.errors.detail && "error-validate"}`}
                    name="amount"
                    value={formikUpdate.values.amount}
                    onChange={formikUpdate.handleChange}
                    onBlur={formikUpdate.handleBlur} 
                    placeholder={formikUpdate.errors.amount && formikUpdate.errors.amount} />
                </div>
                <span className="input-label px-4 inline-flex items-center border border-l-0 border-t-0 
                  border-gray-200 bg-gray-50 text-gray-500">
                  Currency
                </span>
                <div className="w-[300px] relative">
                  <select id="currencies" className="appearance-none py-1 px-3 pr-11 block w-full text-right 
                    border border-t-0 border-l-0 border-gray-200 focus:z-10 focus:border-gray-300 
                    focus:outline-none" 
                      name="currency"
                      value={formikUpdate.values.currency}
                      onChange={formikUpdate.handleChange}
                      onBlur={formikUpdate.handleBlur} >
                    <option value="VND">VND</option>
                    <option value="JPY">JPY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
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
                    ${formikUpdate.errors.detail && "error-validate"}`} 
                    name="detail"
                    value={formikUpdate.values.detail}
                    onChange={formikUpdate.handleChange}
                    onBlur={formikUpdate.handleBlur} placeholder={formikUpdate.errors.detail && formikUpdate.errors.detail}  />
                </div>
                <span className="input-label px-4 inline-flex items-center border border-l-0 border-t-0 
                  border-gray-200 bg-gray-50 text-gray-500">
                  Status
                </span>
                <div className="w-[300px] relative">
                  <select id="currencies" className="appearance-none py-1 px-3 pr-11 block w-full text-right 
                    border border-t-0 border-l-0 border-gray-200 focus:z-10 focus:border-gray-300 
                    focus:outline-none" 
                      name="status"
                      value={formikUpdate.values.status}
                      onChange={formikUpdate.handleChange}
                      onBlur={formikUpdate.handleBlur} >
                    <option value="WAITING">WAITING</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="CANCEL">CANCEL</option>
                  </select>
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
                  Description
                </span>
                <div className="w-full relative">
                  <input type="text" className={`py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 
                    focus:z-10 focus:border-gray-300 focus:outline-none`} 
                    name="description"
                    value={formikUpdate.values.description}
                    onChange={formikUpdate.handleChange}
                    onBlur={formikUpdate.handleBlur}/>
                </div>
              </div>

              {
                (listFile != null && listFile.length > 0) ?
                  <div className="flex">
                    <span className="input-label px-4 inline-flex items-center border border-t-0 border-r-0 
                      border-gray-200 bg-gray-50 text-gray-500">
                      Upload files
                    </span>

                    <div className="flex items-center justify-stretch w-full relative border border-l-0 border-t-0 
                    border-gray-200">
                      <ul className='w-full pb-1'>
                      {
                          listFile.map((f: any, index) => {
                            return (
                              <li className='flex justify-stretch text-sm border border-t-0 border-b-0 border-r-0 border-gray-200 
                              rounded-sm w-full px-3 pt-1' key={index}>
                                <span className='inline-flex items-center w-full'>{f}</span>
                                <a href={`http://localhost:3000/uploads/expenses/${f}`} className="btn btn-success" download>Download</a>
                              </li>
                            )
                          })
                      }
                      </ul>
                    </div>
                  </div>
                  : 
                  <></>
              }
              
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
              </div>
            </form>
          </Modal>
        </div>
      </div>
    </>
  );
}
