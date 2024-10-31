"use client"

import React, { useEffect, useState, useContext } from 'react'
import Modal from 'react-modal';

import $ from "jquery"
import { useFormik } from 'formik';
import * as yup from 'yup';

import Pagination from "react-js-pagination";


import LoadingDots from "@/components/loading-dots";

import toast from "react-hot-toast";

import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

import { MdOutlineCancel, MdOutlineCheckCircle, MdOutlineSupervisedUserCircle } from "react-icons/md"
import { FiSearch } from "react-icons/fi"
import { MdOutlineClear, MdCancel } from "react-icons/md"
import { RiFileEditFill, RiDeleteBin2Fill, RiFileExcelLine, RiCheckDoubleLine } from "react-icons/ri"
import { BsPlusCircleFill } from "react-icons/bs"
import { AiFillSave, AiOutlineFieldTime, AiOutlineRollback, AiOutlineUpload } from "react-icons/ai"
import { FaRegClock, FaHourglass, FaSave, FaUserClock, FaUserTie } from "react-icons/fa"
import { BiArrowBack } from "react-icons/bi"


import axios from 'axios';
import moment from 'moment';
import { Calendar } from 'primereact/calendar';
import { useRouter } from 'next/navigation';
import ConfirmBox from '@/components/confirm';

import "primereact/resources/themes/lara-light-indigo/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";                                //icons

import { Dialog } from 'primereact/dialog';
import { useSession } from 'next-auth/react';

export default function TimeSheet(sessions: any) {

  const session : any = useSession() 

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  const [maxResults, setMaxResults] = useState(10);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File>();
  const [fromDate, setFromDate] = useState(new Date());
  const [memberId, setMemberId] = useState("");
  const router = useRouter();

  const handlePagination = async (page: any) => {
    setPage(page);
  }

  function objToQueryString(obj: any) {
    const keyValuePairs = [];
    for (const key in obj) {
      keyValuePairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
    }
    return keyValuePairs.join('&');
  }

  const [timeSheet, settimeSheet] = useState([]);
  const [members, setMembers] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [totalRequest, setTotalRequest] = useState(0);
  const [totalRequestMember, setTotalRequestMember] = useState(0);
  const [listRequest, setListRequest] = useState([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [timeById, setTimeById] = useState([]);
  const [requestById, setRequestById] = useState([]);
  const [approver, setApprover] = useState([]);
  const [holiday, setHoliday] = useState([]);
  const [workStart, setWorkStart] = useState("");
  const [workEnd, setWorkEnd] = useState("");
  // const [employeeId, setEmployeeId] = useState(session?.data?.user?.role === "MANAGER" && session?.data?.user?.employee_id.toString());

  const isValidDate = (date: any) => {
    return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
  }

  function sleep(ms: any) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const getListTimeSheet = async () => {

    if(isValidDate(fromDate)){
      if(session?.status === "loading"){
        const queryString = objToQueryString({
          keyword: sessions?.params?.loginUserRole === "USER" ? sessions?.params?.loginEmployee : memberId,
          fromMonth: moment(fromDate).format("MM/yyyy"),
          page: page,
        });
    
        fetch(`/api/timesheet/list?${queryString}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        }).then(async (res: any) => {
          let data = await res.json();
          console.log(data);
          getCountRequest();
          setMembers(data.listMember);
          setTotalHours(data.listTotalHours);
          setTotal(data.total);
          setMaxResults(data.maxResults);
          settimeSheet(data.timeSheet);
          setIsOpenRequest(false);
          setHoliday(data.listHoliday);
          setWorkStart(data.workStart);
          setWorkEnd(data.workEnd);
        });
      }else {
        const queryString = objToQueryString({
          keyword: session?.data?.user?.role === "USER" ? session?.data?.user?.employee_id.toString() : memberId,
          fromMonth: moment(fromDate).format("MM/yyyy"),
          page: page,
        });
    
        fetch(`/api/timesheet/list?${queryString}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        }).then(async (res: any) => {
          let data = await res.json();
          console.log(data);
          getCountRequest();
          setMembers(data.listMember);
          setTotalHours(data.listTotalHours);
          setTotal(data.total);
          setMaxResults(data.maxResults);
          settimeSheet(data.timeSheet);
          setIsOpenRequest(false);
          setHoliday(data.listHoliday);
          setWorkStart(data.workStart);
          setWorkEnd(data.workEnd);
        });
      }
      
    }else {
      toast.error("Invalid date time!");
    }
  };

  const searchTimeSheet = async (event: any) => {
      const queryString = objToQueryString({
        keyword: session?.data?.user?.role === "USER" ? session?.data?.user?.employee_id.toString() : memberId,
        fromMonth: moment(event.value).format("MM/yyyy"),
        page: page,
      });

      fetch(`/api/timesheet/list?${queryString}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      }).then(async (res: any) => {
        let data = await res.json();
        console.log(data);
        getCountRequest();
        setMembers(data.listMember);
        setTotalHours(data.listTotalHours);
        setTotal(data.total);
        setMaxResults(data.maxResults);
        settimeSheet(data.timeSheet);
        setIsOpenRequest(false);
        setHoliday(data.listHoliday);
        setWorkStart(data.workStart);
        setWorkEnd(data.workEnd);
      });
  };

  const searchTimeSheetByName = async (event: any) => {
    
      const queryString = objToQueryString({
        keyword: event,
        fromMonth: moment(fromDate).format("MM/yyyy"),
        page: page,
      });

      fetch(`/api/timesheet/list?${queryString}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      }).then(async (res: any) => {
        let data = await res.json();
        console.log(data);
        getCountRequest();
        setMembers(data.listMember);
        setTotalHours(data.listTotalHours);
        setTotal(data.total);
        setMaxResults(data.maxResults);
        settimeSheet(data.timeSheet);
        setIsOpenRequest(false);
        setHoliday(data.listHoliday);
        setWorkStart(data.workStart);
        setWorkEnd(data.workEnd);
      });
  };


  const handleUpload = async () => {
    setSelectedImage("");
    setUploading(true);
    try {
      const headers = { "Content-Type": "application/json" }
      if (!selectedFile) return;
      const formData = new FormData();
      formData.append("myTxt", selectedFile);
      const { data } = await axios.post("api/timesheet/upload", formData);
      insertData();
    } catch (error: any) {
      console.log(error.response?.data);

    }
  }

  const insertData = () => {
    fetch(`/api/timesheet/generateDb`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(res => {
      if (res.status === 200) {
        toast.success("Upload file information successfully.");
        setIsOpen(false);
        getListTimeSheet();
      } else {
        toast.error(res.statusText);
      }

      setUploading(false);
    });
  }

  const [isActive, setIsActive] = useState(false);
  const caculateTimeSheetByHoliday = () => {
    setIsActive(true);
    fetch("/api/timesheet/caculate", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(res => {
    if (res.status === 200) {
      toast.success("Caculate timesheet information successfully.");
      setIsActive(false);
      getListTimeSheet();
    } else {
      toast.error(res.statusText);
    }
  });
  }

  const getById = (id: number) => {
    const queryString = objToQueryString({
      timeId: id,
      page: page
    });
    fetch(`/api/timesheet/listTimeSheet?${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(async (res: any) => {
      let data = await res.json();
      setTimeById(data.timeSheet);
      setApprover(data.getEmployeeByRole);
      setIsAddOpen(true);
    })
  }

  const getCountRequest = async () => {
    const queryString = objToQueryString({
      keyword: session?.data?.user?.role === "ADMIN" ? memberId : session?.data?.user?.employee_id.toString(),
      page: page,
    });
    fetch(`/api/timesheet/listTimeSheet?${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(async (res: any) => {
      let data = await res.json();
      setTotalRequest(data.totalRequest);
    });
  }

  const getRequestById = (id: number) => {
    const queryString = objToQueryString({
      timeId: id,
      page: page
    });
    fetch(`/api/timesheet/listTimeSheet?${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(async (res: any) => {
      let data = await res.json();
      console.log(data);
      setRequestById(data.getRequestByid);
      setApprover(data.getEmployeeByRole);
      setIsEditOpen(true);
    })
  }

  const [message, setMessage] = useState("");
  const [currentIndex, setCurrentIndex] = useState(-1);
  const customModalStyles = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)'
    },
    content: {
      width: '420px',
      overflow: 'hidden',
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)'
    }
  }
  // Init search
  useEffect(() => {
    console.log("useEffect");

    Modal.setAppElement('#modals');
    Modal.setAppElement('#addModals');
    Modal.setAppElement('#editModals');

    getListTimeSheet();
  }, [page])

  const [request, setRequest] = useState({
    date: new Date(),
    employee_id: '',
    timeSheet_id: '',
    time_in: '',
    time_out: '',
    approve_id: '',
    reason: '',
  });

  const formikAdd = useFormik({
    initialValues: request,
    onSubmit: (target: any) => {
      fetch("/api/timesheet/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: target.date,
          employee_id: Number(target.employee_id),
          timeSheet_id: Number(target.timeSheet_id),
          time_in: target.time_in.length === 5 ? target.time_in + ":00" : target.time_in,
          time_out: target.time_out.length === 5 ? target.time_out + ":00" : target.time_out,
          approve_id: Number(target.approve_id),
          reason: target.reason
        }),
      }).then(async (res) => {
        setLoading(false);
        if (res.status === 200) {
          getListTimeSheet();
          setIsAddOpen(false);
          setMessage("");
          toast.success("Request time sheet information successfully.");
        } else {
          toast.error(await res.text());
        }
      });
    }
  })

  const [requests, setRequests] = useState({
    id: '',
    date: new Date(),
    employee_id: '',
    timeSheet_id: '',
    time_in: '',
    time_out: '',
    approve_id: '',
    reason: '',
  });

  const formikUpdate = useFormik({
    initialValues: requests,
    enableReinitialize: true,
    onSubmit: (target: any) => {
      fetch("/api/timesheet/editRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: target.id,
          date: target.date,
          employee_id: Number(target.employee_id),
          timeSheet_id: Number(target.timeSheet_id),
          time_in: target.time_in.length === 5 ? target.time_in + ":00" : target.time_in,
          time_out: target.time_out.length === 5 ? target.time_out + ":00" : target.time_out,
          approve_id: Number(target.approve_id),
          reason: target.reason
        }),
      }).then(async (res) => {
        if (res.status === 200) {
          getListTimeSheet();
          setIsEditOpen(false);
          toast.success("Update time sheet request information successfully.");
        } else {
          toast.error(await res.text());
          setRequests(target);
        }
      });
    }
  })

  const [isOpenRequest, setIsOpenRequest] = useState(false);
  const getListRequest = () => {
    const queryString = objToQueryString({
      keyword: session?.data?.user?.role === "ADMIN" ? memberId : session?.data?.user?.employee_id.toString(),
      page: page,
    });
    fetch(`/api/timesheet/listTimeSheet?${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(async (res: any) => {
      let data = await res.json();
      setTotalRequestMember(data.totalRequest);
      setListRequest(data.getTimeSheetRequest);
      setIsOpenRequest(true);
    });
  }


  const confirmRejected = async (req: any) => {

    const data = {
      icon: <FaUserTie />,
      title: "Reject Timesheet",
      message: "Are you sure want to reject this timesheet request?"
    }

    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <ConfirmBox data={data} onClose={onClose} onYes={() => updateRejected({ req })} onNo={() => console.log("NO")} />
        );
      }
    });
  };

  const confirmApprove = async (req: any) => {

    const data = {
      icon: <FaUserTie />,
      title: "Approve Timesheet",
      message: "Are you sure want to approve this timesheet request?"
    }

    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <ConfirmBox data={data} onClose={onClose} onYes={() => updateApprove({ req })} onNo={() => console.log("NO")} />
        );
      }
    });
  };

  const updateRejected = ({ req }: any) => {

    fetch("/api/timesheet/editRequest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: req.requestId,
        date: req.date,
        employee_id: Number(req.employee_id),
        timeSheet_id: Number(req.id),
        time_in: req.time_in,
        time_out: req.time_out,
        approve_id: Number(req.approve_id),
        reason: req.reason,
        status: "REJECTED"
      }),
    }).then(async (res) => {
      if (res.status === 200) {
        setIsOpenRequest(true);
        getListRequest();
        
        toast.success("Update time sheet request information successfully.");
      } else {
        toast.error(await res.text());
      }
    });
  }

  const updateApprove = ({ req }: any) => {

    fetch("/api/timesheet/approve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: req.requestId,
        date: req.date,
        employee_id: Number(req.employee_id),
        timeSheet_id: Number(req.id),
        time_in: req.timeIn,
        time_out: req.timeOut,
        approve_id: Number(req.approve_id),
        reason: req.reason,
        status: "APPROVED"
      }),
    }).then(async (res) => {
      if (res.status === 200) {
        getListRequest();
        setIsOpenRequest(false);
        toast.success("Update time sheet request information successfully.");
      } else {
        toast.error(await res.text());
      }
    });
  }

  const [isMemberView, setMemberView] = useState(false);


  return (
    <>
      <Dialog visible={isActive} closable={false} className="text-center" onHide={() => {}} 
        headerClassName="loading-header" contentClassName='loading-content'>
        <img height="64px" className="" src="/loading.gif" alt="loading" />
      </Dialog>

      <div className={``}>
        <div className="text-lg flex items-center gap-x-4 cursor-pointer rounded-md">
          <span className='text-3xl block float-left'><FaRegClock /></span>
          <h1>TIMESHEET</h1>
        </div>

        <hr className="border-1 border-gray-500 drop-shadow-xl mt-1 mb-2" />

        {
          session?.data?.user?.role == "ADMIN" || session?.data?.user?.role == "MANAGER" ?
          <div className="flex xl:w-full mb-3">
            <span className={`inline-flex items-center border border-gray-300 px-3 py-1 cursor-pointer ${!isMemberView ? "bg-light-blue text-white border-light-blue" : ""} `} onClick={() => setMemberView(true)}>Overview</span>
            <span className={`inline-flex items-center border border-l-0 border-gray-300 px-3 py-1 cursor-pointer ${isMemberView ? "bg-light-blue text-white border-light-blue" : ""} `} onClick={() => { setMemberView(false); router.push("/timesheet/member") }}>Member</span>
          </div> : <></>
        }
        


        {
          isOpenRequest ? 
          <div className="flex justify-between xl:w-full">
            <div className="flex justify-center">
              <div className="relative flex rounded-md items-stretch w-auto">
                <button className="inline-flex items-center px-3 py-1 bg-gray-400 hover:bg-gray-300 text-white 
                  text-sm font-medium rounded-md" type="button" onClick={() => getListTimeSheet()}>
                  <BiArrowBack />&nbsp;
                  Back
                </button>
              </div>
            </div>
          </div> :
          <div className="flex justify-between xl:w-full">
          <div className="flex justify-center">
            <div className="relative flex rounded-md items-stretch w-auto">
              {
                session?.data?.user?.role == "ADMIN" || session?.data?.user?.role == "MANAGER" ?
                <select id="keyword" className={`relative inline-flex px-3 pr-5
                            appearance-none border border-r-0 font-normal text-gray-700 bg-white bg-clip-padding border-solid 
                            border-gray-300 text-sm focus:z-10 
                            focus:border-gray-300 focus:outline-none `} onChange={(e) => {searchTimeSheetByName(e.target.value); setMemberId(e.target.value)}}>
                  <option value="">All</option>
                  {
                    members != null && members.length > 0 ? (
                      members.map((m: any, index) => {
                        return (
                          <option key={"member-" + index} value={m.id}>{m.name}</option>
                        )
                      })
                    ) : (<></>)
                  }
                </select> : <></>
              }
              

              <div className="w-100 flex-none relative">
                <Calendar
                  id="from-date" placeholder='Month' showIcon showButtonBar
                  className={`calendar-picker cell-calendar-picker search-calendar-picker border
                    border-gray-300`}
                  view={"month"}
                  dateFormat="yy-mm"
                  value={fromDate}
                  onChange={(e: any) => {searchTimeSheet(e); setFromDate(e.value);}}
                />
              </div>
            </div>


            <span className='inline-flex items-center ml-3 px-3 bg-gray-200 text-gray-800 rounded-full'>
              <FaHourglass /> &nbsp;Total Hours: {totalHours} 
            </span>
          </div>

          
            
            {
              session?.data?.user?.role == "ADMIN" ?
              <div>
                {
                  totalRequest > 0 ?
                    <a href='#' className='inline-flex items-center ml-3 px-3 py-1.5 bg-red-600 text-white rounded-full'
                      onClick={() => getListRequest()}>
                      {totalRequest}
                    </a> : <></>
                }
                <button className="ml-2 inline-flex items-center px-6 py-2 bg-dark-blue hover:bg-indigo-600 text-white 
                text-sm font-medium rounded-md" type="button" onClick={() => caculateTimeSheetByHoliday()}>
                  <BsPlusCircleFill />
                  &nbsp;Caculate
                </button>

                <button className="ml-2 inline-flex items-center px-6 py-2 bg-dark-blue hover:bg-indigo-600 text-white 
                  text-sm font-medium rounded-md" type="button" onClick={() => setIsOpen(true)}>
                  <AiOutlineUpload />&nbsp;
                  {uploading ? "Importing .." : "Import"}
                </button>
              </div> :
              <div>
                {
                  totalRequest > 0 ?
                    <a href='#' className='inline-flex items-center ml-3 px-3 py-1.5 bg-red-600 text-white rounded-full'
                      onClick={() => getListRequest()}>
                      {totalRequest}
                    </a> : <></>
                }
              </div>  
            }
            

          

        </div>
        }
        

        <div className="mx-auto mt-2">
          <div className="flex flex-col">
            <div className="overflow-x-auto rounded-t-lg h-[calc(100vh-210px)]">
              <div className="inline-block w-full align-middle">
                <div className="overflow-hidden ">

                  <table className="w-full divide-y divide-gray-200">
                    {
                      isOpenRequest ?
                        <thead className="bg-light-blue">
                          <tr>
                            <th scope="col" className="w-[35px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase" rowSpan={2}>
                              No
                            </th>
                            <th scope="col" className="w-[100px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase" rowSpan={2}>
                              Date
                            </th>
                            <th scope="col" className="w-[70px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase" rowSpan={2}>
                              DOW
                            </th>
                            <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase" rowSpan={2}>
                              Member
                            </th>
                            <th scope="col" className="w-[240px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase" colSpan={2}>
                              Time In
                            </th>
                            <th scope="col" className="w-[240px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase" colSpan={2}>
                              Time Out
                            </th>
                            <th scope="col" className="w-[70px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase" rowSpan={2}>

                            </th>
                          </tr>
                          <tr>
                            <th scope="col" className="w-[70px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                              Actual
                            </th>
                            <th scope="col" className="w-[70px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                              Request
                            </th>
                            <th scope="col" className="w-[70px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                              Actual
                            </th>
                            <th scope="col" className="w-[70px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                              Request
                            </th>
                          </tr>
                        </thead>
                        :
                        <thead className="bg-light-blue">
                          <tr>
                            <th scope="col" className="w-[35px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                              No
                            </th>
                            <th scope="col" className="w-[100px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                              Date
                            </th>
                            <th scope="col" className="w-[70px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                              DOW
                            </th>
                            <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                              Member
                            </th>
                            <th scope="col" className="w-[75px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                              Time In
                            </th>
                            <th scope="col" className="w-[75px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                              Time Out
                            </th>
                            <th scope="col" className="w-[70px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                              Total Hours
                            </th>
                            <th scope="col" className="w-[100px] p-2 border border-gray-300 bg-light-blue text-white text-xs 
                          font-medium uppercase">
                              Lack/Over (Minutes)
                            </th>
                            <th scope="col" className="w-[160px] p-2 border border-gray-300 bg-light-blue text-white text-xs 
                          font-medium uppercase">
                              Status(In/Out)
                            </th>
                            <th scope="col" className="w-[70px] p-2 border border-gray-300 bg-light-blue text-white text-xs 
                          font-medium uppercase">
                              Status
                            </th>
                            <th scope="col" className="w-[70px] p-2 border border-gray-300 bg-light-blue text-white text-xs 
                          font-medium uppercase">
                              Time Ot
                            </th>
                            <th scope="col" className="w-[55px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">

                            </th>
                          </tr>
                        </thead>
                    }


                    <tbody className="bg-white">
                      {
                        timeSheet != null && timeSheet.length > 0 && isOpenRequest == false ? (
                          timeSheet.map((time: any, index) => {
                            return (
                              <tr className={"hover:bg-gray-100"}
                                key={"timesheet-" + index}>

                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`} style={{ textAlign: 'center' }}>
                                  <span className={` ${(index == currentIndex) && "hidden"}`}>{(page - 1)*maxResults + index + 1}</span>
                                </td>

                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`} style={{ textAlign: 'center' }}>
                                  <span className={` ${(index == currentIndex) && "hidden"}`}>{time.date}</span>

                                </td>

                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300 uppercase`} style={moment(time.date).format("dddd") === "Sunday" || moment(time.date).format("dddd") === "Saturday" ? { textAlign: 'center', color: 'red' } : { textAlign: 'center' }}>
                                  <span className={` ${(index == currentIndex) && "hidden"}`} style={holiday.some((h: any) => h.date === time.date) ? {color:'red'}: {}}>{moment(time.date).format("ddd")}</span>

                                </td>

                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`}>
                                  <span className={` ${(index == currentIndex) && "hidden"}`}>{time.name}</span>

                                </td>

                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`} style={ (time.time_in >  workStart) ? { color: 'red', textAlign: 'center' } : { textAlign: 'center' }}>
                                  <span className={` ${(index == currentIndex) && "hidden"}`} 
                                  style={moment(time.date).format("dddd") === "Sunday" || moment(time.date).format("dddd") === "Saturday" ? { color: 'black' } : {}}>{moment(time.time_in, 'HH:mm:ss').format("HH:mm")}</span>

                                </td>

                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`} style={time.time_out < workEnd ? { color: 'red', textAlign: 'center' } : { textAlign: 'center' }}>
                                  <span className={` ${(index == currentIndex) && "hidden"}`}
                                  style={moment(time.date).format("dddd") === "Sunday" || moment(time.date).format("dddd") === "Saturday" ? { color: 'black' } : {}}>{moment(time.time_out, 'HH:mm:ss').format("HH:mm")}</span>

                                </td>


                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`} style={{ textAlign: 'center' }}>
                                  <span className={` ${(index == currentIndex) && "hidden"}`}>{time.total_hours.length === 4 ? "0" + time.total_hours : time.total_hours}</span>

                                </td>

                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300 `} style={time.diff_hours < 0 ? { color: 'red', textAlign: 'right' } : { textAlign: 'right' }}>
                                  <span className={` ${(index == currentIndex) && "hidden"}`}>{time.diff_hours == 0 ? "ー" : time.diff_hours}</span>

                                </td>

                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`} style={time.status_in === "MISSING" || time.status_out === "MISSING" ? { color: 'red' } : {}}>
                                  <span className={` ${(index == currentIndex) && "hidden"}`} style={time.status_in === "EARLY" || time.status_in === "LATE" ? { color: '#F27B2C' } : {}}>{time.status_in} </span>
                                  <span className={` ${(index == currentIndex) && "hidden"}`} style={time.status_out === "EARLY" || time.status_out === "LATE" ? { color: '#F27B2C' } : {}}> | {time.status_out} </span>
                                </td>
                                <td className="p-2 text-sm font-normal text-right border border-gray-300" style={{ textAlign: 'center' }}>
                                  <span className={` ${(index == currentIndex) && "hidden"}`} >{time.status} </span>
                                </td>
                                <td className="p-2 text-sm font-normal text-right border border-gray-300">

                                </td>
                                <td className="p-2 text-sm font-normal text-right border border-gray-300" style={{ textAlign: 'center' }}>
                                  {
                                    time.status === 'REQUEST' ? (
                                      <>
                                        <a href="#" className={`text-base text-red-600 hover:underline mr-1 ${session?.data?.user?.role === "MANAGER" && session?.data?.user?.employee_id !== time.employee_id && "hidden"}`}
                                          onClick={() => {
                                            setRequests({
                                              id: time.requestId,
                                              date: time.date,
                                              employee_id: time.employee_id,
                                              timeSheet_id: time.id,
                                              time_in: time.timeIn,
                                              time_out: time.timeOut,
                                              approve_id: time.approve_id,
                                              reason: time.reason
                                            });
                                            formikUpdate.setValues({
                                              id: time.requestId,
                                              date: new Date(moment(time.date).format("YYYY-MM-DD")),
                                              employee_id: time.employee_id,
                                              timeSheet_id: time.id,
                                              time_in: time.timeIn,
                                              time_out: time.timeOut,
                                              approve_id: time.approve_id,
                                              reason: time.reason
                                            });
                                            getRequestById(time.id);
                                          }}>
                                          <AiOutlineFieldTime />
                                        </a>
                                      </>
                                    ) : (
                                      
                                      <>
                                        <a href="#" className={`text-base text-insight-green hover:underline mr-1 ${session?.data?.user?.role === "MANAGER" && session?.data?.user?.employee_id !== time.employee_id && "hidden"}`}
                                          onClick={() => {
                                            setRequest({
                                              date: time.date,
                                              employee_id: time.employee_id,
                                              timeSheet_id: time.id,
                                              time_in: time.time_in,
                                              time_out: time.time_out,
                                              approve_id: '',
                                              reason: ''
                                            });
                                            formikAdd.setValues({
                                              date: new Date(moment(time.date).format("YYYY-MM-DD")),
                                              employee_id: time.employee_id,
                                              timeSheet_id: time.id,
                                              time_in: time.time_in,
                                              time_out: time.time_out,
                                              approve_id: '',
                                              reason: ''
                                            });
                                            getById(time.id);
                                          }}>
                                          <RiFileEditFill />
                                        </a>
                                      </>
                                    )
                                  }


                                </td>
                              </tr>
                            )
                          })
                        ) : isOpenRequest == false && (
                          <tr className="">
                            <td colSpan={14} className="p-2 text-sm font-normal text-center border border-gray-300">
                              No Data
                            </td>
                          </tr>
                        )

                      }

                      {
                        isOpenRequest &&
                          listRequest != null && listRequest.length > 0 ? (
                          listRequest.map((req: any, index) => {
                            return (
                              <tr className={"hover:bg-gray-100"}
                                key={"timesheet-" + index}>

                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal text-gray-900 border border-gray-300`} style={{ textAlign: 'center' }}>
                                  <span className={` ${(index == currentIndex) && "hidden"}`}>{index + 1}</span>
                                </td>

                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal text-gray-900 border border-gray-300`} style={{ textAlign: 'center' }}>
                                  <span className={` ${(index == currentIndex) && "hidden"}`}>{req.date}</span>

                                </td>

                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal text-gray-900 border border-gray-300 uppercase`} style={moment(req.date).format("dddd") === "Sunday" || moment(req.date).format("dddd") === "Saturday" ? { textAlign: 'center', color: 'red' } : { textAlign: 'center' }}>
                                  <span className={` ${(index == currentIndex) && "hidden"}`}>{moment(req.date).format("ddd")}</span>

                                </td>

                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal text-gray-900 border border-gray-300`}>
                                  <span className={` ${(index == currentIndex) && "hidden"}`}>{req.name}</span>

                                </td>

                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal text-gray-900 border border-gray-300`} style={Date.parse(req.dateParse + " " + req.time_in) > Date.parse(req.dateParse + " " + "09:30:00") ? { color: 'red', textAlign: 'center' } : { textAlign: 'center' }}>
                                  <span className={` ${(index == currentIndex) && "hidden"}`}>{moment(req.time_in, 'HH:mm:ss').format("HH:mm")}</span>

                                </td>

                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal text-gray-900 border border-gray-300`} style={Date.parse(req.dateParse + " " + req.timeIn) > Date.parse(req.dateParse + " " + "09:30:00") ? { color: 'red', textAlign: 'center' } : { textAlign: 'center' }}>
                                  <span className={` ${(index == currentIndex) && "hidden"}`}>{moment(req.timeIn, 'HH:mm:ss').format("HH:mm")}</span>

                                </td>

                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal text-gray-900 border border-gray-300`} style={new Date(req.date + " " + req.time_out).getHours() < 18 ? { color: 'red', textAlign: 'center' } : { textAlign: 'center' }}>
                                  <span className={` ${(index == currentIndex) && "hidden"}`}>{moment(req.time_out, 'HH:mm:ss').format("HH:mm")}</span>

                                </td>

                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal text-gray-900 border border-gray-300`} style={new Date(req.date + " " + req.timeOut).getHours() < 18 ? { color: 'red', textAlign: 'center' } : { textAlign: 'center' }}>
                                  <span className={` ${(index == currentIndex) && "hidden"}`}>{moment(req.timeOut, 'HH:mm:ss').format("HH:mm")}</span>

                                </td>

                                <td className="p-2 text-sm font-normal text-right border border-gray-300" style={{ textAlign: 'center' }}>
                                  <a href="#" className="text-base text-blue-600 hover:underline mr-1"
                                    onClick={() => confirmRejected(req)}>
                                    <MdOutlineCancel />
                                  </a>
                                  <a href="#" className="text-base text-blue-600 hover:underline"
                                    onClick={() => { confirmApprove(req) }}>
                                    <MdOutlineCheckCircle />
                                  </a>


                                </td>
                              </tr>
                            );
                          })
                        ) : isOpenRequest &&
                        (
                          <tr className="">
                            <td colSpan={14} className="p-2 text-sm font-normal text-center border border-gray-300">
                              No Data
                            </td>
                          </tr>
                        )
                      }


                    </tbody>
                  </table> 
                  
                </div>
              </div>
            </div>
            <div id="pagination">
              <Pagination
                activePage={page}
                totalItemsCount={isOpenRequest ? totalRequest : total}
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

      <div id="modals" />
      <Modal
        isOpen={isOpen}
        ariaHideApp={false}
        onRequestClose={() => setIsOpen(false)}
        style={customModalStyles}>


        <div className='max-w-4xl mx-auto' style={{ textAlign: 'center' }}>
          <label>
            <input
              type='file'
              hidden
              onChange={({ target }) => {
                if (target.files) {
                  const file = target.files[0];
                  setSelectedImage(URL.createObjectURL(file))
                  setSelectedFile(file);
                }
              }}
            ></input>
            <div className='w-100 rounded flex items-center justify-center border-2 border-dashed cursor-pointer p-5'>
              {
                selectedImage ? <span>{selectedFile?.name}</span> :
                  <img src="http://100dayscss.com/codepen/upload.svg" className="upload-icon" />
              }
            </div>
          </label>
          <div className='mt-3 flex justify-between'>
            <button className="inline-flex items-center px-3 py-2 bg-gray-400 hover:bg-gray-600 text-white 
                        text-sm font-medium rounded-md" type="button" onClick={() => setIsOpen(false)}>
              <span className='text-xl block float-left mr-2'><MdCancel /></span>
              Cancel
            </button>

            <button className="inline-flex items-center px-3 py-2 bg-arius-green hover:bg-light-green text-white 
                        text-sm font-medium rounded-md" type="submit"
              disabled={uploading} onClick={() => handleUpload()}>
              {
                uploading ? (
                  <LoadingDots color="#808080" />
                ) : (
                  <>
                    <span className='text-xl block float-left mr-2'><AiOutlineUpload /></span>Upload
                  </>
                )
              }
            </button>
          </div>
        </div>
      </Modal>

      <div id="addModals" />
      <Modal
        isOpen={isAddOpen}
        ariaHideApp={false}
        onRequestClose={() => setIsAddOpen(false)}
        style={customModalStyles}>
        <div className="text-lg flex items-center gap-x-4 cursor-pointer rounded-md">
          <span className='text-3xl block float-left'><FaRegClock /></span>
          <h1>Request Time Sheet</h1>
        </div>

        <div hidden={message == ""} className="mt-2 mb-2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative text-sm"
          role="alert">
          <span className="block sm:inline">{message}</span>
        </div>

        <form className="" onSubmit={formikAdd.handleSubmit}>
          <div className='mt-3'>
            {
              (timeById !== null && timeById.length > 0) ?

                timeById.map((time: any, index) => {
                  return (
                    <div key={index}>
                      <input type="text" name="id" id="id" value={time.id} hidden onBlur={formikAdd.handleBlur} onChange={formikAdd.handleChange} />
                      <input type="text" name="employee_id" id="employee_id" value={time.employee_id} hidden onBlur={formikAdd.handleBlur} onChange={formikAdd.handleChange} />
                      <div className='flex'>
                        <span className="input-label px-4 inline-flex items-center border border-r-0 border-gray-200 
                                                bg-gray-50 text-sm text-gray-500">Date</span>
                        <input type="text" name="date" id="date" disabled value={moment(time.date).format("yyyy-MM-DD")}
                          className='py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 
                                                    focus:border-gray-300 focus:outline-none'
                          onBlur={formikAdd.handleBlur} onChange={formikAdd.handleChange} />
                      </div>
                      <div className='flex'>
                        <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                                                bg-gray-50 text-sm text-gray-500">Time in</span>
                        <input type="time" name="time_in" id="time_in" defaultValue={moment(time.time_in, 'HH:mm:ss').format("HH:mm")} onChange={formikAdd.handleChange}
                          onBlur={formikAdd.handleBlur} className='py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                                                    focus:z-10 focus:border-gray-300 focus:outline-none' />
                      </div>
                      <div className='flex'>
                        <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                                                bg-gray-50 text-sm text-gray-500">Time out</span>
                        <input type="time" name="time_out" id="time_out" defaultValue={moment(time.time_out, 'HH:mm:ss').format("HH:mm")} onChange={formikAdd.handleChange}
                          onBlur={formikAdd.handleBlur} className='py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                                                    focus:z-10 focus:border-gray-300 focus:outline-none' />
                      </div>
                    </div>

                  );
                })
                : <></>
            }

            <div className='flex relative'>
              <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                            bg-gray-50 text-sm text-gray-500">Approver</span>
              <div className="w-full relative">
                <select name="approve_id" id="approve_id" className="appearance-none py-1 px-3 pr-11 block w-full border border-t-0 
                                border-gray-200 text-sm focus:z-10 focus:border-gray-300 focus:outline-none"
                  required
                  onChange={formikAdd.handleChange}
                  onBlur={formikAdd.handleBlur} >
                  <option value="">Select a approver</option>
                  {
                    approver != null && approver.length > 0 ? (
                      approver.map((a: any, index) => {
                        return (
                          <option key={"approver-" + index} value={a.id}>{a.name}</option>
                        )
                      })
                    ) : (<></>)
                  }
                </select>
              </div>
            </div>
            <div className='flex '>
              <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">Reason</span>
              <textarea className='py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                  focus:z-10 focus:border-gray-300 focus:outline-none'
                name="reason" id="reason" rows={2} onChange={formikAdd.handleChange}
                onBlur={formikAdd.handleBlur}></textarea>
            </div>
          </div>


          <div className='mt-3 flex justify-between'>
            <button className="inline-flex items-center px-3 py-2 bg-gray-400 hover:bg-gray-600 text-white 
                text-sm font-medium rounded-md" type="button" onClick={() => setIsAddOpen(false)}>
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
                    <span className='text-xl block float-left mr-2'><AiFillSave /></span>Send
                  </>
                )
              }
            </button>

          </div>
        </form>
      </Modal>

      <div id="editModals" />
      <Modal
        isOpen={isEditOpen}
        ariaHideApp={false}
        onRequestClose={() => setIsEditOpen(false)}
        style={customModalStyles}
      >
        <div className="text-lg flex items-center gap-x-4 cursor-pointer rounded-md">
          <span className='text-3xl block float-left'><FaRegClock /></span>
          <h1>Edit Request Time Sheet</h1>
        </div>

        <div hidden={message == ""} className="mt-2 mb-2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative text-sm"
          role="alert">
          <span className="block sm:inline">{message}</span>
        </div>

        <form className="" onSubmit={formikUpdate.handleSubmit}>
          <div className='mt-3'>
            {
              (requestById !== null && requestById.length > 0) ?

                requestById.map((request: any, index) => {
                  return (
                    <div key={index}>
                      <input type="text" name="id" id="id" value={request.id} hidden onBlur={formikUpdate.handleBlur} onChange={formikUpdate.handleChange} />
                      <input type="text" name="employee_id" id="employee_id" value={request.employee_id} hidden onBlur={formikUpdate.handleBlur} onChange={formikUpdate.handleChange} />
                      <div className='mt-3'>
                        <div className='flex'>
                          <span className="input-label px-4 inline-flex items-center border border-r-0 border-gray-200 
                                                bg-gray-50 text-sm text-gray-500">Date</span>
                          <input type="text" name="date" id="date" disabled value={moment(request.date).format("yyyy-MM-DD")}
                            className='py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 
                                                    focus:border-gray-300 focus:outline-none'
                            onBlur={formikUpdate.handleBlur} onChange={formikUpdate.handleChange} />
                        </div>
                        <div className='flex'>
                          <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                                                    bg-gray-50 text-sm text-gray-500">Time in</span>
                          <input type="time" name="time_in" id="time_in" defaultValue={moment(request.time_in, 'HH:mm:ss').format("HH:mm")} onChange={formikUpdate.handleChange}
                            onBlur={formikUpdate.handleBlur} className='py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                                                        focus:z-10 focus:border-gray-300 focus:outline-none'/>
                        </div>
                        <div className='flex'>
                          <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                                                    bg-gray-50 text-sm text-gray-500">Time out</span>
                          <input type="time" name="time_out" id="time_out" defaultValue={moment(request.time_out, 'HH:mm:ss').format("HH:mm")} onChange={formikUpdate.handleChange}
                            onBlur={formikUpdate.handleBlur} className='py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                                                        focus:z-10 focus:border-gray-300 focus:outline-none'/>
                        </div>
                      </div>
                      <div className='flex relative'>
                        <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                                                bg-gray-50 text-sm text-gray-500">Approver</span>
                        <div className="w-full relative">
                          <select name="approve_id" id="approve_id" className="appearance-none py-1 px-3 pr-11 block w-full border border-t-0 
                                                border-gray-200 text-sm focus:z-10 focus:border-gray-300 focus:outline-none"
                            defaultValue={request.approve_id}
                            required
                            onChange={formikAdd.handleChange}
                            onBlur={formikAdd.handleBlur} >
                            <option value="">Select a approver</option>
                            {
                              approver != null && approver.length > 0 ? (
                                approver.map((a: any, index) => {
                                  return (
                                    <option key={"approver-" + index} value={a.id}>{a.name}</option>
                                  )
                                })
                              ) : (<></>)
                            }
                          </select>
                        </div>
                      </div>
                      <div className='flex'>
                        <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                                                bg-gray-50 text-sm text-gray-500">Reason</span>
                        <textarea className='py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                                                focus:z-10 focus:border-gray-300 focus:outline-none'
                          name="reason" id="reason" rows={2} defaultValue={request.reason} onChange={formikUpdate.handleChange}
                          onBlur={formikUpdate.handleBlur}></textarea>
                      </div>
                    </div>
                  );
                })
                : <></>
            }


          </div>


          <div className='mt-3 flex justify-between'>
            <button className="inline-flex items-center px-3 py-2 bg-gray-400 hover:bg-gray-600 text-white 
                text-sm font-medium rounded-md" type="button" onClick={() => setIsEditOpen(false)}>
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
                    <span className='text-xl block float-left mr-2'><AiFillSave /></span>Send
                  </>
                )
              }
            </button>

          </div>
        </form>
      </Modal>
    </>
  );
}