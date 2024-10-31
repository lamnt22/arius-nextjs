"use client"

import React, { useEffect, useState, useContext } from 'react'
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

import { FaUserTie, FaInfoCircle } from "react-icons/fa"
import { FiSearch } from "react-icons/fi"
import { MdOutlineClear, MdCancel } from "react-icons/md"
import { RiFileEditFill, RiDeleteBin2Fill, RiMoneyDollarCircleLine } from "react-icons/ri"
import { BsPlusCircleFill } from "react-icons/bs"
import { AiFillSave } from "react-icons/ai"
import { FaSave } from "react-icons/fa"

import ConfirmBox from "../../components/confirm"

import "primereact/resources/themes/lara-light-indigo/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";                                //icons


import { Calendar } from 'primereact/calendar';
import { useSession } from 'next-auth/react';

export default function Member() {

  const session : any = useSession()

  useEffect(() => {
    Modal.setAppElement('#modals');
  }, []);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  const [maxResults, setMaxResults] = useState(10);

  const handlePagination = async (page:any) => {
    setPage(page);
  }


  const [isOpen, setIsOpen] = React.useState(false)
  const [isOpenDetail, setIsOpenDetail] = React.useState(false)
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

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const formikAdd = useFormik({
    initialValues: {
      name: '',
      code: '',
      position: '',
      birthday: '',
      salary: '',
      phone: '',
      address: '',
      status: '',
      description: '',
    },
    onSubmit: (target: any) => {
      let birthday = moment.utc(target.birthday).tz("Asia/Ho_Chi_Minh").format().replace("+07:00", "Z");

      if (target.position == "") {
        target.position = "INTERN";
      }
      if (target.status == "") {
        target.status = "ON";
      }

      fetch("/api/member/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: target.name,
          code: target.code,
          position: target.position,
          birthday: birthday,
          salary: target.salary,
          phone: target.phone,
          address: target.address,
          status: target.status,
          description: target.description
        }),
      }).then(async (res) => {
        setLoading(false);
        if (res.status === 200) {
          searchMember();
          setIsOpen(false);
          setMessage("");
          toast.success("Create member successfully.");
        } else {
          setMessage(await res.text());
        }
      });
    },
    validationSchema: yup.object({
      name: yup.string().trim().required('Required'),
      code: yup.string().trim().required('Required'),
    }),
  });


  const [ currentIndex, setCurrentIndex ] = useState(-1);

  const [ member, setMember ] = useState({
    id: '',
    name: '',
    code: '',
    position: '',
    birthday: new Date(),
    phone: '',
    address: '',
    salary: '',
    status: '',
    description: '',
  });

  const formikUpdate = useFormik({
    initialValues: member,
    enableReinitialize: true,

    onSubmit: (target: any) => {

      let birthday = moment.utc(target.birthday).tz("Asia/Ho_Chi_Minh").format().replace("+07:00", "Z");

      fetch("/api/member/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: target.id,
          name: target.name,
          code: target.code,
          position: target.position,
          birthday: birthday,
          salary: target.salary,
          phone: target.phone,
          address: target.address,
          status: target.status,
          description: target.description
        }),
      }).then(async (res) => {
        if (res.status === 200) {
          searchMember();
          setCurrentIndex(-1);
          toast.success("Update member information successfully.");
        } else {
          toast.error(await res.text());
          setMember(target);
        }
      });
    },

    validationSchema: yup.object({
      name: yup.string().trim().required('Required'),
      code: yup.string().trim().required('Required'),
    }),
  });


  function objToQueryString(obj: any) {
    const keyValuePairs = [];
    for (const key in obj) {
      keyValuePairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
    }
    return keyValuePairs.join('&');
  }

  const [members, setMembers] = useState([]);

  const searchMember = async () => {

    const queryString = objToQueryString({
      keyword: $("#keyword").val(),
      position: $("#member-role").val(),
      page: page,
    });
    fetch(`/api/member/list?${queryString}`, { 
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(async (res: any) => {
      let data = await res.json();
      setTotal(data.total);
      setMaxResults(data.maxResults);
      setMembers(data.members);
    });
  };


  // Init search
  useEffect(() => {
    searchMember();
  }, [page]);


  const confirmMember = async (id: any) => {

    const data = {
      icon: <FaUserTie />,
      title: "Member Delete",
      message: "Are you sure want to delete this member?"
    }

    confirmAlert({
      customUI: ({ onClose}) => {
        return (
          <ConfirmBox data={data} onClose={onClose} onYes={() => deleteMember({id})} onNo={() => console.log("NO")} />
        );
      }
    });
  };

  const deleteMember = ({ id } : any) => {
    
    fetch("/api/member/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id
      }),
    }).then(async (res) => {
      if (res.status === 200) {
        searchMember();
        setCurrentIndex(-1);
        toast.success("Delete member information successfully.");
      } else {
        toast.error(await res.text());
      }
    });
  }

  const[showSalary, setShowSalary] = useState(false);


  return (
    <>
      <div className={``}>
        <div className="text-lg flex items-center gap-x-4 cursor-pointer rounded-md">
          <span className='text-3xl block float-left'><FaUserTie /></span>
          <h1>MEMBERS</h1>
        </div>

        <hr className="border-1 border-gray-500 drop-shadow-xl mt-1 mb-2" />

        <div className="flex justify-between xl:w-full">
          <div className="flex justify-center">
            <div className="relative flex rounded-md items-stretch w-auto">

              <input type="search" className="relative inline-flex items-center min-w-0 w-full px-3 py-1 text-base 
                rounded-l-md border border-r-0 font-normal text-gray-700 bg-white bg-clip-padding border-solid 
                border-gray-300 transition ease-in-out m-0 focus:text-gray-700 focus:bg-white 
                focus:border-gray-400 focus:outline-none" id="keyword"
                placeholder="Search" />

              <select id="member-role" className={`relative inline-flex px-3 pr-5
                appearance-none border border-r-0 font-normal text-gray-700 bg-white bg-clip-padding border-solid 
                border-gray-300 text-sm focus:z-10 
                focus:border-gray-300 focus:outline-none `}>
                <option value="">Role</option>
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

              <button className="btn px-2.5 py-2 font-medium text-base leading-tight uppercase
                rounded-r-md hover:bg-gray-500 hover:text-white border border-gray-300 bg-white
                flex items-center" type="button" onClick={() => searchMember()}>
                <FiSearch />
              </button>
            </div>
              
            <button className="ml-2 btn px-2 py-2 font-medium text-base leading-tight uppercase 
              rounded-md  hover:bg-gray-700 hover:text-white border border-gray-300 bg-white
              flex items-center" type="button" onClick={() => {
                $("#keyword").val(""); $("#member-role").val(""); searchMember();
              }}>
              <MdOutlineClear />
            </button>
          </div>

          {
            session?.data?.user?.role === "ADMIN" ?  
            <div>
              <button className="ml-2 inline-flex items-center px-6 py-2 bg-dark-blue hover:bg-indigo-600 text-white 
                text-sm font-medium rounded-md" type="button" onClick={() => setIsOpen(true)}>
                <BsPlusCircleFill />&nbsp;
                New Member
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
                            Member Name
                          </th>
                          <th scope="col" className="w-[90px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Code
                          </th>
                          <th scope="col" className="w-[155px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Position
                          </th>
                          <th scope="col" className="w-[100px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Birthday
                          </th>
                          <th scope="col" className="w-[90px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            <div className='inline-flex items-center cursor-pointer' 
                              onClick={() => setShowSalary(!showSalary)}>
                              <RiMoneyDollarCircleLine className='text-xl' />&nbsp;Salary
                            </div>
                          </th>
                          <th scope="col" className="w-[100px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Phone
                          </th>
                          <th scope="col" className="w-[70px] p-2 border border-gray-300 bg-light-blue text-white text-xs 
                            font-medium uppercase">
                            Status
                          </th>
                          <th scope="col" className="w-[80px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody className="bg-white">
                        {
                          members != null && members.length > 0 ? (
                            members.map((member: any, index) => {
                              
                              return (
                                <tr className="hover:bg-gray-100" key={"member-" + index}>
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
                                    <span className={` ${(index == currentIndex) && "hidden"}`}>{member.name}</span>
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
                                    <span className={` ${(index == currentIndex) && "hidden"}`}>{member.code}</span>
                                    <input type="text" className={` ${(index != currentIndex) && "hidden"} 
                                      py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 text-center 
                                      focus:border-gray-300 focus:outline-none bg-table-input 
                                      ${formikUpdate.errors.code && "error-validate"}`} 
                                      name="code"
                                      value={formikUpdate.values.code}
                                      onChange={formikUpdate.handleChange}
                                      onBlur={formikUpdate.handleBlur} 
                                      placeholder={formikUpdate.errors.code && formikUpdate.errors.code}  />
                                  </td>
  
                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300 text-center`}>
                                    <span className={` ${(index == currentIndex) && "hidden"}`}>
                                      {member.position.replace("_", " ")} {/* .replace(/(^\w|\s\w)/g, (m:any) => m.toUpperCase()) */}
                                    </span>
                                    <select id="member-position" className={` ${(index != currentIndex) && "hidden"} 
                                      appearance-none block border border-t-0 border-gray-200 text-sm focus:z-10 
                                      focus:border-gray-300 focus:outline-none bg-table-input w-full`} 
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
                                    text-gray-900 border border-gray-300`}>
                                    <span className={` ${(index == currentIndex) ? "hidden" : "block"} w-full text-center`}>{member.birthday}</span>
                                    <Calendar
                                      id="birthday" 
                                      className={` calendar-picker cell-calendar-picker bg-table-input`}
                                      dateFormat="yy-mm-dd"
                                      name='birthday'
                                      value={formikUpdate.values.birthday}
                                      onChange={formikUpdate.handleChange}
                                      style={(index != currentIndex) ? {display: "none"} : {}}
                                    />
                                  </td>
  
                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`}>
                                    <span className={` ${(index == currentIndex) && "hidden"} block text-right`}>
                                      {(showSalary && member.salary) ? member.salary.toLocaleString("en-US") : "********"}
                                    </span>
                                    <input type="text" className={` ${(index != currentIndex) && "hidden"} 
                                        py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 
                                        focus:border-gray-300 focus:outline-none bg-table-input text-right`} 
                                      name="salary"
                                      value={formikUpdate.values.salary}
                                      onChange={formikUpdate.handleChange}
                                      onBlur={formikUpdate.handleBlur} />
                                  </td>
  
                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`}>
                                    <span className={` ${(index == currentIndex) ? "hidden" : "block"} text-right`}>{member.phone}</span>
                                    <input type="text" className={` ${(index != currentIndex) && "hidden"} 
                                        py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 
                                        focus:border-gray-300 focus:outline-none bg-table-input 
                                        ${formikUpdate.errors.phone && "error-validate"} text-right`} 
                                      name="phone"
                                      value={formikUpdate.values.phone}
                                      onChange={formikUpdate.handleChange}
                                      onBlur={formikUpdate.handleBlur} />
                                  </td>
  
                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`}>
                                    <span className={` ${(index == currentIndex) ? "hidden" : "block"} text-center`}>{member.status}</span>
                                    <select id="status"  className={` ${(index != currentIndex) && "hidden"} 
                                        appearance-none block border border-t-0 border-gray-200 text-sm focus:z-10 
                                        focus:border-gray-300 focus:outline-none bg-table-input w-full`} 
                                        name="status"
                                        value={formikUpdate.values.status}
                                        onChange={formikUpdate.handleChange}
                                        onBlur={formikUpdate.handleBlur} >
                                      <option value="ON">ON</option>
                                      <option value="OFF">OFF</option>
                                    </select>
                                  </td>
  
                                  {
                                    session?.data?.user?.role === "ADMIN" ? 
                                    <td className="p-2 text-sm font-normal text-center border border-gray-300">
                                      {
                                        index == currentIndex ? (
                                          <>
                                            <a href="#" className="text-base text-blue-600 hover:underline mr-1" 
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
                                                setMember({
                                                  id: member.id,
                                                  name: member.name,
                                                  code: member.code,
                                                  position: member.position,
                                                  birthday: moment(member.birthday, "YYYY-MM-DD").toDate(),
                                                  phone: member.phone,
                                                  address: member.address,
                                                  salary: member.salary,
                                                  status: member.status,
                                                  description: member.description
                                                });
                                                formikUpdate.setValues({
                                                  id: member.id,
                                                  name: member.name,
                                                  code: member.code,
                                                  position: member.position,
                                                  birthday: moment(member.birthday, "YYYY-MM-DD").toDate(),
                                                  phone: member.phone,
                                                  address: member.address,
                                                  salary: member.salary,
                                                  status: member.status,
                                                  description: member.description
                                                });
                                                setCurrentIndex(index);
                                              }}>
                                                <RiFileEditFill />
                                            </a>
                                            <a href="#" className="text-base text-red-600 hover:underline float-left mr-1" 
                                              onClick={() => { confirmMember(member.id) }}>
                                              <RiDeleteBin2Fill />
                                            </a>
                                            <a href="#" className="text-base text-green-600 hover:underline" 
                                              onClick={() => {  }}>
                                              <FaInfoCircle />
                                            </a>
                                          </>
                                        )
                                      }
                                    </td>: <td className="p-2 text-sm font-normal text-center border border-gray-300">
                                      <a href="#" className="text-base text-green-600 hover:underline" 
                                        onClick={() => { 
                                          formikUpdate.setValues({
                                            id: member.id,
                                            name: member.name,
                                            code: member.code,
                                            position: member.position,
                                            birthday: moment(member.birthday, "YYYY-MM-DD").toDate(),
                                            phone: member.phone,
                                            address: member.address,
                                            salary: "********",
                                            status: member.status,
                                            description: member.description
                                          });
                                          setIsOpenDetail(true); 
                                          }}>
                                        <FaInfoCircle />
                                      </a>
                                    </td>
                                  }
                                  
                                </tr>
                              )
                            })
                          ) : (
                            <tr className="">
                              <td colSpan={9} className="p-2 text-sm font-normal text-center border border-gray-300">
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
            <span className='text-3xl block float-left'><FaUserTie /></span>
            <h1>Member Information</h1>
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
                  Member Name
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
                  Role
                </span>
                <div className="w-full relative">
                  <select id="countries" className="appearance-none py-1 px-3 pr-11 block w-full border border-t-0 
                      border-gray-200 text-sm focus:z-10 focus:border-gray-300 focus:outline-none" 
                      name="position"
                      onChange={formikAdd.handleChange}
                      onBlur={formikAdd.handleBlur} >
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
                  Birthday
                </span>
                <Calendar
                  id="birthday"
                  className="calendar-picker border border-t-0 border-gray-200"
                  dateFormat="yy-mm-dd"
                  name='birthday'
                  onChange={formikAdd.handleChange}
                />
              </div>

              <div className="flex">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Salary
                </span>
                <input type="text" className="py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                  focus:z-10 focus:border-gray-300 focus:outline-none"
                  name="salary"
                  onChange={formikAdd.handleChange}
                  onBlur={formikAdd.handleBlur} />
              </div>

              <div className="flex">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Phone
                </span>
                <input type="text" className="py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                  focus:z-10 focus:border-gray-300 focus:outline-none"
                  name="phone"
                  onChange={formikAdd.handleChange}
                  onBlur={formikAdd.handleBlur} />
              </div>

              <div className="flex">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Address
                </span>
                <textarea className="py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                  focus:z-10 focus:border-gray-300 focus:outline-none" rows={2}
                  name="address"
                  onChange={formikAdd.handleChange}
                  onBlur={formikAdd.handleBlur} />
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
                    <option value="ON">ON</option>
                    <option value="OFF">OFF</option>
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

        <div id="detail" />
        <Modal 
          isOpen={isOpenDetail} 
          ariaHideApp={false} 
          onRequestClose={() => setIsOpenDetail(false)} 
          style={customModalStyles}>

          <div className="text-lg flex items-center gap-x-4 cursor-pointer rounded-md">
            <span className='text-3xl block float-left'><FaUserTie /></span>
            <h1>Member Information</h1>
          </div>

          <div hidden={message == ""} className="mt-2 mb-2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative text-sm" 
            role="alert">
            <span className="block sm:inline">{message}</span>
          </div>

          <form className="" onSubmit={formikUpdate.handleSubmit}>
            <div className='mt-3'>
              <div className="flex">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Member Name
                </span>
                <input type="text" className={`py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 
                  focus:border-gray-300 focus:outline-none ${formikUpdate.errors.name && "error-validate"}`} 
                  name="name" disabled value={formikUpdate.values.name}  />
              </div>

              <div className="flex">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Code
                </span>
                <input type="text" className={`py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                  focus:z-10 focus:border-gray-300 focus:outline-none ${formikUpdate.errors.name && "error-validate"}`} 
                  name="code" disabled value={formikUpdate.values.code} />
              </div>

              <div className="flex relative">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Role
                </span>
                <div className="w-full relative">
                  <select id="countries" className="appearance-none py-1 px-3 pr-11 block w-full border border-t-0 
                      border-gray-200 text-sm focus:z-10 focus:border-gray-300 focus:outline-none" 
                      name="position" disabled value={formikUpdate.values.position} >
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
                  Birthday
                </span>
                <Calendar
                  id="birthday"
                  className="calendar-picker border border-t-0 border-gray-200"
                  dateFormat="yy-mm-dd"
                  name='birthday' disabled
                  value={formikUpdate.values.birthday}
                />
              </div>

              <div className="flex">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Salary
                </span>
                <input type="text" className="py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                  focus:z-10 focus:border-gray-300 focus:outline-none"
                  name="salary" disabled value={formikUpdate.values.salary} />
              </div>

              <div className="flex">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Phone
                </span>
                <input type="text" className="py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                  focus:z-10 focus:border-gray-300 focus:outline-none"
                  name="phone" disabled value={formikUpdate.values.phone}/>
              </div>

              <div className="flex">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Address
                </span>
                <textarea className="py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                  focus:z-10 focus:border-gray-300 focus:outline-none" rows={2}
                  name="address" disabled value={formikUpdate.values.address} />
              </div>

              <div className="flex relative">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Status
                </span>
                <div className="w-full relative">
                  <select id="status" className="appearance-none py-1 px-3 pr-11 block w-full border border-t-0 
                      border-gray-200 text-sm focus:z-10 focus:border-gray-300 focus:outline-none" 
                      name="status" disabled value={formikUpdate.values.status} >
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
                  name="description" disabled value={formikUpdate.values.description} />
              </div>
            </div>

            
          </form>
          
        </Modal>
      </div>
    </>
  );
}
