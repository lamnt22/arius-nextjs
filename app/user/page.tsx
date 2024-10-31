"use client"

import LoadingDots from '@/components/loading-dots';
import { useFormik } from 'formik';
import React, { use, useEffect, useState } from 'react'
import { AiFillSave } from 'react-icons/ai';
import { BsPinterest, BsPlusCircleFill } from 'react-icons/bs';
import { MdCancel, MdInterests, MdOutlineClear } from 'react-icons/md';
import Pagination from 'react-js-pagination';
import Modal from 'react-modal';
import toast from "react-hot-toast";
import moment from 'moment';
import { RiDeleteBin2Fill, RiFileEditFill, RiUserSettingsFill } from 'react-icons/ri';
import ConfirmBox from "../../components/confirm"
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Calendar } from 'primereact/calendar';
import * as yup from 'yup';
import { FaInfoCircle, FaLock, FaLockOpen, FaSave } from 'react-icons/fa';
import $ from "jquery";
import { FiSearch } from 'react-icons/fi';
import { redirect } from 'next/navigation'
import { useSession } from 'next-auth/react';


export default function User() {

  const session : any = useSession()

  useEffect(() => {
    if (session?.data?.user?.role !== "ADMIN") {
      redirect("/dashboard");
    }
  }, [false]);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  const [maxResults, setMaxResults] = useState(10);
  const [listUser, setListUser] = useState([]);
  const [userById, setUserById] = useState([]); 
  const [isOpen, setIsOpen] = React.useState(false);
  const [isOpenDetails, setIsOpenDetails] = React.useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [keyword, setkeyword] = useState("");
  const [members, setMembers] = useState([]);

  useEffect(() => {
    Modal.setAppElement('#modals');
    Modal.setAppElement('#modalDetails');
  }, []);

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

  const getListUser = async () => {
    const queryString = objToQueryString({
        keyword: $("#keyword").val(),
        page: page,
    });

    fetch(`/api/user/list?${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(async (res: any) => {
      let data = await res.json();
      console.log(data);
      setListUser(data.listUser);
      setTotal(data.total);
      setMaxResults(data.maxResults);
      setMembers(data.listMember);
    })
  }

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

  const formikAdd = useFormik({
    initialValues: {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
        employee_id: '',
    },
    onSubmit: (target: any) => {
      fetch("/api/user/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: target.username,
            email: target.email,
            password: target.password,
            role: target.role,
            employee_id: target.employee_id,
            confirmPassword: target.confirmPassword
        }),
      }).then(async (res) => {
        setLoading(false);
        if (res.status === 200) {
          getListUser();
          setIsOpen(false);
          setMessage("");
          toast.success("Add user information successfully.");
        }else {
          toast.error(await res.text());
        }
      })
    },
    validationSchema: yup.object({
      username: yup.string().trim().required('Required'),
      password: yup.string().trim().required('Required'),
      confirmPassword: yup.string().trim().required('Required').oneOf([yup.ref('password')], 'confirm password not match'),
      email: yup.string().trim().required('Required').matches(/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/, 'Email is invalid'),
  }),
  })

  const [user, setUser] = useState({
    id: '',
    username: '',
    email: '',
    role: '',
    employee_id: '',
    password: '',
    confirmPassword: ''
  })

  const formikUpdate = useFormik({
    initialValues: user,
    enableReinitialize: true,

    onSubmit: (target: any) => {

        fetch("/api/user/edit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: target.id,
                username: target.username,
                email: target.email,
                role: target.role,
                employee_id: target.employee_id,
                password: target.password,
                confirmPassword: target.confirmPassword
            }),
        }).then(async (res) => {
            if (res.status === 200) {
              getListUser();
              setIsOpenDetails(false);
              setCurrentIndex(-1);
              toast.success("Update user information successfully.");
            } else {
              toast.error(await res.text());
              setUser(target);
            }
          });
    },
    validationSchema: yup.object({
      username: yup.string().trim().required('User name is required'),
      password: yup.string().trim().required('Password is required'),
      confirmPassword: yup.string().trim().required('Confirm password is required').oneOf([yup.ref('password')], 'confirm password not match'),
      email: yup.string().trim().required('Email is required').matches(/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/, 'Email is invalid'),
    }),
  })

  const confirmLockUser = async (id: any, lock: any) => {
    const data = {
      icon: <RiUserSettingsFill />,
      title: "User Lock",
      message: "Are you sure want to lock this user?"
    }

    confirmAlert({
      customUI: ({ onClose}) => {
        return (
          <ConfirmBox data={data} onClose={onClose} onYes={() => lockUser({id, lock})} onNo={() => console.log("NO")} />
        );
      }
    });
  };

  const confirmUnlockUser = async (id: any, lock: any) => { 
    const data = {
      icon: <RiUserSettingsFill />,
      title: "User Unlock",
      message: "Are you sure want to unlock this user?"
    }

    confirmAlert({
      customUI: ({ onClose}) => {
        return (
          <ConfirmBox data={data} onClose={onClose} onYes={() => lockUser({id, lock})} onNo={() => console.log("NO")} />
        );
      }
    });
  };

  const lockUser = ({id, lock}: any) => {
    fetch("/api/user/unlock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        lock_flag: lock
      }),
  }).then(async (res) => {
      if (res.status === 200) {
        getListUser();
        toast.success("Lock user information successfully.");
      } else {
        toast.error(await res.text());
      }
    });
  }

  const confirmUser = async (id: any) => {
    console.log(id);
    
    const data = {
      icon: <RiUserSettingsFill />,
      title: "User Delete",
      message: "Are you sure want to delete this user?"
    }

    confirmAlert({
      customUI: ({ onClose}) => {
        return (
          <ConfirmBox data={data} onClose={onClose} onYes={() => deleteUser({id})} onNo={() => console.log("NO")} />
        );
      }
    });
  };

  const deleteUser = ({ id } : any) => {
    
    fetch("/api/user/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id
      }),
    }).then(async (res) => {
      if (res.status === 200) {
        getListUser();
        setCurrentIndex(-1);
        toast.success("Delete user successfully.");
      } else {
        toast.error(await res.text());
      }
    });
  }

  useEffect(() => {
    getListUser();

  }, [page])

  return (
    <>
      <div className={``}>
        <div className="text-lg flex items-center gap-x-4 cursor-pointer rounded-md">
          <span className='text-3xl block float-left'><RiUserSettingsFill /></span>
          <h1>USER</h1>
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

                <button className="btn px-2.5 py-2 font-medium text-base leading-tight uppercase
                  rounded-r-md hover:bg-gray-500 hover:text-white border border-gray-300 bg-white
                  flex items-center" type="button" onClick={() => getListUser()}>
                  <FiSearch />
                </button>

                <button className="ml-2 btn px-2 py-2 font-medium text-base leading-tight uppercase 
                  rounded-md  hover:bg-gray-700 hover:text-white border border-gray-300 bg-white
                  flex items-center" type="button" onClick={() => {
                    $("#keyword").val(""); getListUser();
                  }}>
                  <MdOutlineClear />
                </button>
            </div>


          </div>

          <div>


            <button className="ml-2 inline-flex items-center px-6 py-2 bg-dark-blue hover:bg-indigo-600 text-white 
              text-sm font-medium rounded-md" type="button" onClick={() => setIsOpen(true)}>
              <BsPlusCircleFill />&nbsp;
              New User
            </button>

          </div>

        </div>


        <div className="mx-auto mt-2">
          <div className="flex flex-col">
            <div className="overflow-x-auto rounded-t-lg h-[calc(100vh-210px)]">
              <div className="inline-block w-full align-middle">
                <div className="overflow-hidden ">
                  <form className="" onSubmit={formikUpdate.handleSubmit}>
                    <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-light-blue">
                      <tr>
                        <th scope="col" className="w-[35px] p-2 border border-gray-300 bg-light-blue text-white 
                          text-xs font-medium uppercase" rowSpan={2}>
                          No
                        </th>
                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                          text-xs font-medium uppercase" rowSpan={2}>
                          Employee
                        </th>
                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                          text-xs font-medium uppercase" rowSpan={2}>
                          Username
                        </th>
                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                          text-xs font-medium uppercase" rowSpan={2}>
                          Email
                        </th>
                        <th scope="col" className="w-[100px] p-2 border border-gray-300 bg-light-blue text-white 
                        text-xs font-medium uppercase">
                          Role
                        </th>
                        <th scope="col" className="w-[95px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                          
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {
                        listUser != null && listUser.length > 0 ? (
                          listUser.map((u: any, index) => {
                            return (
                              <tr className={"hover:bg-gray-100"} key={"timesheet-" + index}>
                                <td className={`p-2 text-sm font-normal 
                                  text-gray-900 border border-gray-300`} style={{ textAlign: 'center' }}>
                                  <span className="p-2 text-center">{(page - 1) * maxResults + index + 1}</span>
                                </td>
                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                  text-gray-900 border border-gray-300`} style={{ textAlign: 'left' }}>
                                  <span className={` ${(index == currentIndex) && "hidden"}`}>{u.name}</span>
                                  <select id="member-role" className={` ${(index != currentIndex) && "hidden"} 
                                      appearance-none block border border-t-0 border-gray-200 text-sm focus:z-10 
                                      focus:border-gray-300 focus:outline-none bg-table-input w-full`} 
                                        name="employee_id"
                                        value={formikUpdate.values.employee_id}
                                        onChange={formikUpdate.handleChange}
                                        onBlur={formikUpdate.handleBlur} >
                                        {
                                            members != null && members.length > 0 ? (
                                                members.map((m: any, index) => {
                                                return (
                                                    <option className='text-left' key={"member-" + index} value={m.id}>{m.name}</option>
                                                )
                                                })
                                            ) : (<></>)
                                        }
                                    </select>
                                </td>
                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                  text-gray-900 border border-gray-300`} style={{ textAlign: 'left' }}>
                                  <span className={` ${(index == currentIndex) && "hidden"}`}>{u.username}</span>
                                  <input type="text" className={` ${(index != currentIndex) && "hidden"} 
                                        py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 
                                        focus:border-gray-300 focus:outline-none bg-table-input text-left`} 
                                      name="username"
                                      value={formikUpdate.values.username}
                                      onChange={formikUpdate.handleChange}
                                      onBlur={formikUpdate.handleBlur} />
                                </td>
                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                  text-gray-900 border border-gray-300`} style={{ textAlign: 'left' }}>
                                  <span className={` ${(index == currentIndex) && "hidden"}`}>{u.email}</span>
                                  <input type="text" className={` ${(index != currentIndex) && "hidden"} 
                                        py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 
                                        focus:border-gray-300 focus:outline-none bg-table-input text-left`} 
                                      name="email"
                                      value={formikUpdate.values.email}
                                      onChange={formikUpdate.handleChange}
                                      onBlur={formikUpdate.handleBlur} />
                                </td>
                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                  text-gray-900 border border-gray-300`} style={{ textAlign: 'left' }}>
                                  <span className={` ${(index == currentIndex) && "hidden"}`}>{u.role}</span>
                                    <select id="member-role" className={` ${(index != currentIndex) && "hidden"} 
                                      appearance-none block border border-t-0 border-gray-200 text-sm focus:z-10 
                                      focus:border-gray-300 focus:outline-none bg-table-input w-full`} 
                                        name="role"
                                        value={formikUpdate.values.role}
                                        onChange={formikUpdate.handleChange}
                                        onBlur={formikUpdate.handleBlur} >
                                        <option value="ADMIN">Admin</option>
                                        <option value="USER">User</option>
                                        <option value="MANAGER">Manager</option>
                                    </select>
                                </td>
                                <td className="p-2 text-sm font-normal text-right border border-gray-300" style={{ textAlign: 'center' }}>
                                {
                                      index == currentIndex ? (
                                        <>
                                          <a href="#" className="text-base text-blue-600 hover:underline mr-1" 
                                            onClick={() => { 
                                              $('#btn-update-user').click(); 
                                              return false;
                                            } } >
                                              <FaSave />
                                          </a>
                                          <button id="btn-update-user" className="hidden items-center px-3 
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
                                              setUser({
                                                id: u.id,
                                                username: u.username,
                                                email: u.email,
                                                role: u.role,
                                                employee_id: u.employee_id,
                                                password: u.password,
                                                confirmPassword: u.password
                                              });
                                              formikUpdate.setValues({
                                                id: u.id,
                                                username: u.username,
                                                email: u.email,
                                                role: u.role,
                                                employee_id: u.employee_id,
                                                password: u.password,
                                                confirmPassword: u.password
                                              });
                                              setCurrentIndex(index);
                                            }}>
                                              <RiFileEditFill />
                                          </a>
                                          <a href="#" className="text-base text-red-600 hover:underline float-left mr-1" 
                                            onClick={() => { confirmUser(u.id) }}>
                                            <RiDeleteBin2Fill />
                                          </a>
                                          <a href="#" className="text-base text-blue-600 hover:underline float-left mr-1" 
                                            onClick={() => {
                                              setUser({
                                                id: u.id,
                                                username: u.username,
                                                email: u.email,
                                                role: u.role,
                                                employee_id: u.employee_id,
                                                password: u.password,
                                                confirmPassword: u.password
                                              });
                                              formikUpdate.setValues({
                                                id: u.id,
                                                username: u.username,
                                                email: u.email,
                                                role: u.role,
                                                employee_id: u.employee_id,
                                                password: u.password,
                                                confirmPassword: u.password
                                              });
                                              setIsOpenDetails(true);
                                            }}>
                                              <FaInfoCircle />
                                          </a>
                                          {
                                            u.lock_flag == 0 ? 
                                            <a href="#" className="text-base text-green-600 hover:underline" 
                                              onClick={() => { confirmLockUser(u.id, true) }}>
                                              <FaLock />
                                            </a>
                                            :
                                            <a href="#" className="text-base text-green-600 hover:underline" 
                                              onClick={() => { confirmUnlockUser(u.id, false) }}>
                                              <FaLockOpen />
                                            </a>
                                          }
                                          
                                        </>
                                      )
                                    }
                                </td>
                              </tr>
                            )
                          })
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

      <div id="modals" />
      <Modal
        isOpen={isOpen}
        ariaHideApp={false}
        onRequestClose={() => setIsOpen(false)}
        style={customModalStyles}>


        <div className="text-lg flex items-center gap-x-4 cursor-pointer rounded-md">
          <span className='text-3xl block float-left'><RiUserSettingsFill /></span>
          <h1>Add User</h1>
        </div>

        <div hidden={message == ""} className="mt-2 mb-2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative text-sm"
          role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
        {
                ((formikAdd.errors.username && formikAdd.touched.username) || 
                    (formikAdd.errors.email && formikAdd.touched.email) || 
                    (formikAdd.errors.password && formikAdd.touched.password) || 
                    (formikAdd.errors.confirmPassword && formikAdd.touched.confirmPassword)) &&
                <div className="mt-2 mb-2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative text-sm" role="alert">
                    <p className="m-0 p-0">{formikAdd.errors.username}</p>
                    <p className="m-0 p-0">{formikAdd.errors.email}</p>
                    <p className="m-0 p-0">{formikAdd.errors.password}</p>
                    <p className="m-0 p-0">{formikAdd.errors.confirmPassword}</p>
                </div>
            }
        <form className="" onSubmit={formikAdd.handleSubmit}>
          <div className='mt-3'>
              <div className="flex">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  User Name
                </span>
                <input type="text" className={`py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 
                  focus:border-gray-300 focus:outline-none ${formikAdd.errors.username && "error-validate"}`} 
                  name="username"
                  onChange={formikAdd.handleChange}
                  onBlur={formikAdd.handleBlur}/>
              </div>

              <div className="flex">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Email
                </span>
                <input type="email" className={`py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                  focus:z-10 focus:border-gray-300 focus:outline-none ${formikAdd.errors.email && "error-validate"}`} 
                  name="email"
                  onChange={formikAdd.handleChange}
                  onBlur={formikAdd.handleBlur}/>
              </div>

              <div className="flex relative">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Employee
                </span>
                <div className="w-full relative">
                  <select id="countries" className="appearance-none py-1 px-3 pr-11 block w-full border border-t-0 
                      border-gray-200 text-sm focus:z-10 focus:border-gray-300 focus:outline-none" 
                      name="employee_id"
                      onChange={formikAdd.handleChange}
                      onBlur={formikAdd.handleBlur} >
                    {
                        members != null && members.length > 0 ? (
                            members.map((m: any, index) => {
                            return (
                                <option className='text-left' key={"member-" + index} value={m.id}>{m.name}</option>
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
                  Role
                </span>
                <div className="w-full relative">
                  <select id="countries" className="appearance-none py-1 px-3 pr-11 block w-full border border-t-0 
                      border-gray-200 text-sm focus:z-10 focus:border-gray-300 focus:outline-none" 
                      name="role"
                      onChange={formikAdd.handleChange}
                      onBlur={formikAdd.handleBlur} >
                    <option value="ADMIN">Admin</option>
                    <option value="USER">User</option>
                    <option value="MANAGER">Manager</option>
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
                  Password
                </span>
                <input type="password" className={`py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                  focus:z-10 focus:border-gray-300 focus:outline-none ${formikAdd.errors.password && "error-validate"}`}
                  name="password"
                  onChange={formikAdd.handleChange}
                  onBlur={formikAdd.handleBlur} />
              </div>

              <div className="flex">
                <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                  bg-gray-50 text-sm text-gray-500">
                  Confirm Password
                </span>
                <input type="password" className={`py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                  focus:z-10 focus:border-gray-300 focus:outline-none ${formikAdd.errors.confirmPassword && "error-validate"}` }
                  name="confirmPassword"
                  onChange={formikAdd.handleChange}
                  onBlur={formikAdd.handleBlur}/>
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

      <div id="modalDetails" />
      <Modal
        isOpen={isOpenDetails}
        ariaHideApp={false}
        onRequestClose={() => setIsOpenDetails(false)}
        style={customModalStyles}>

        <div className="text-lg flex items-center gap-x-4 cursor-pointer rounded-md">
          <span className='text-3xl block float-left'><RiUserSettingsFill /></span>
          <h1>Edit User</h1>
        </div>

        <div hidden={message == ""} className="mt-2 mb-2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative text-sm"
          role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
        {
            ((formikUpdate.errors.username) || 
                (formikUpdate.errors.email) || 
                (formikUpdate.errors.password) || 
                (formikUpdate.errors.confirmPassword)) &&
            <div className="mt-2 mb-2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative text-sm" role="alert">
                <p className="m-0 p-0">{formikUpdate.errors.username}</p>
                <p className="m-0 p-0">{formikUpdate.errors.email}</p>
                <p className="m-0 p-0">{formikUpdate.errors.password}</p>
                <p className="m-0 p-0">{formikUpdate.errors.confirmPassword}</p>
            </div>
        }
        <form className="" onSubmit={formikUpdate.handleSubmit}>
          <div className='mt-3'>
            <input type="text" name="id" id="id" value={user.id} hidden onBlur={formikUpdate.handleBlur} onChange={formikUpdate.handleChange} />
            <div className="flex">
              <span className="input-label px-4 inline-flex items-center border border-r-0 border-gray-200 
                bg-gray-50 text-sm text-gray-500">
                User Name
              </span>
              <input type="text" className={`py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 
                focus:border-gray-300 focus:outline-none ${formikUpdate.errors.username && "error-validate"}`} 
                name="username" value={formikUpdate.values.username} 
                onChange={formikUpdate.handleChange}
                onBlur={formikUpdate.handleBlur}/>
            </div>

            <div className="flex">
              <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                bg-gray-50 text-sm text-gray-500">
                Email
              </span>
              <input type="email" className={`py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                focus:z-10 focus:border-gray-300 focus:outline-none ${formikUpdate.errors.email && "error-validate"}`} 
                name="email" value={formikUpdate.values.email} 
                onChange={formikUpdate.handleChange}
                onBlur={formikUpdate.handleBlur}/>
            </div>

            <div className="flex relative">
              <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                bg-gray-50 text-sm text-gray-500">
                Employee
              </span>
              <div className="w-full relative">
                <select id="countries" className="appearance-none py-1 px-3 pr-11 block w-full border border-t-0 
                    border-gray-200 text-sm focus:z-10 focus:border-gray-300 focus:outline-none" 
                    name="employee_id" value={formikUpdate.values.employee_id} 
                    onChange={formikUpdate.handleChange}
                    onBlur={formikUpdate.handleBlur} >
                  {
                      members != null && members.length > 0 ? (
                          members.map((m: any, index) => {
                          return (
                              <option className='text-left' key={"member-" + index} value={m.id}>{m.name}</option>
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
                Role
              </span>
              <div className="w-full relative">
                <select id="countries" className="appearance-none py-1 px-3 pr-11 block w-full border border-t-0 
                    border-gray-200 text-sm focus:z-10 focus:border-gray-300 focus:outline-none" 
                    name="role" value={formikUpdate.values.role} 
                    onChange={formikUpdate.handleChange}
                    onBlur={formikUpdate.handleBlur} >
                  <option value="ADMIN">Admin</option>
                  <option value="USER">User</option>
                  <option value="MANAGER">Manager</option>
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
                Password
              </span>
              <input type="password" className={`py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                focus:z-10 focus:border-gray-300 focus:outline-none ${formikUpdate.errors.password && "error-validate"}`}
                name="password" defaultValue={formikUpdate.values.password}
                onChange={formikUpdate.handleChange}
                onBlur={formikUpdate.handleBlur} />
            </div>
          
            <div className="flex">
              <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                bg-gray-50 text-sm text-gray-500">
                Confirm Password
              </span>
              <input type="password" className={`py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                focus:z-10 focus:border-gray-300 focus:outline-none ${formikUpdate.errors.confirmPassword && "error-validate"}` }
                name="confirmPassword" defaultValue={formikUpdate.values.confirmPassword}
                onChange={formikUpdate.handleChange}
                onBlur={formikUpdate.handleBlur}/>
            </div>
          </div>
          <div className='mt-3 flex justify-between'>
            <button className="inline-flex items-center px-3 py-2 bg-gray-400 hover:bg-gray-600 text-white 
                text-sm font-medium rounded-md" type="button" onClick={() => setIsOpenDetails(false)}>
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
    </>
  );
}