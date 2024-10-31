"use client"

import React, { useEffect, useState } from 'react'
import Modal from 'react-modal';

import $ from "jquery"
import { useFormik } from 'formik';
import * as yup from 'yup';

import Pagination from "react-js-pagination";


import LoadingDots from "@/components/loading-dots";

import toast from "react-hot-toast";

import ConfirmBox from "../../components/confirm"
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { BsPlusCircleFill } from 'react-icons/bs';

import * as cheerio from 'cheerio';
import axios from 'axios';
import moment from 'moment';
import { AiFillSave, AiOutlineUpload } from 'react-icons/ai';
import { HiOutlineOfficeBuilding } from 'react-icons/hi';
import { FaInfoCircle, FaSave } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';
import { RiDeleteBin2Fill, RiFileEditFill } from 'react-icons/ri';


export default function Department() {

    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(1);
    const [maxResults, setMaxResults] = useState(10);
    const [listDepartment, setListDepartment] = useState([]);
    const [currentIndex, setCurrentIndex ] = useState(-1);
    const [members, setMembers] = useState([]);
    const [isOpen, setIsOpen] = React.useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        Modal.setAppElement('#modals');
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

    const getListDepartment = async () => {
        const queryString = objToQueryString({
            page: page,
          });
        fetch(`/api/department/list?${queryString}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        }).then(async (res: any) => {
            let data = await res.json();
            setTotal(data.total);
            setMaxResults(data.maxResults);
            setListDepartment(data.department);
            setMembers(data.listMember);
        })
    }

    const formikAdd = useFormik({
        initialValues: {
            name: '',
            manager: ''
        },
        onSubmit: (target: any) => {
            fetch("/api/department/add", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: target.name,
                    manager: target.manager,
                }),
            }).then(async (res) => {
                if (res.status === 200) {
                    getListDepartment();
                    setIsOpen(false);
                    toast.success("Add departments information successfully.");
                }else {
                    toast.error(await res.text());
                    setDepartments(target);
                  }
            })
        }
    })

    const [departments, setDepartments] = useState({
        id: '',
        name: '',
        manager: ''
    });

    const formikUpdate = useFormik({
        initialValues:departments,
        enableReinitialize: true,

        onSubmit: (target: any) => {
            fetch("/api/department/edit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: target.id,
                name: target.name,
                manager: target.manager,
            }),
            }).then(async (res) => {
                if (res.status === 200) {
                    getListDepartment();
                    setCurrentIndex(-1);
                    toast.success("Update departments information successfully.");
                }else {
                    toast.error(await res.text());
                    setDepartments(target);
                  }
            })
        }
    });

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

    const confirmDepartment = async (id: any) => {
        console.log(id);
        
        const data = {
          icon: <HiOutlineOfficeBuilding />,
          title: "Department Delete",
          message: "Are you sure want to delete this department?"
        }
    
        confirmAlert({
          customUI: ({ onClose}) => {
            return (
              <ConfirmBox data={data} onClose={onClose} onYes={() => deleteDepartment({id})} onNo={() => console.log("NO")} />
            );
          }
        });
      };
    
      const deleteDepartment = ({ id } : any) => {
        
        fetch("/api/department/delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: id
          }),
        }).then(async (res) => {
          if (res.status === 200) {
            getListDepartment();
            setCurrentIndex(-1);
            toast.success("Delete user successfully.");
          } else {
            toast.error(await res.text());
          }
        });
      }
    

    useEffect(() => {
        getListDepartment();
        
    }, [page]);

    return(
        <>
            <div className={``}>
                <div className="text-lg flex items-center gap-x-4 cursor-pointer rounded-md">
                    <span className='text-3xl block float-left'><HiOutlineOfficeBuilding /></span>
                    <h1>DEPARTMENT</h1>
                </div>

                <hr className="border-1 border-gray-500 drop-shadow-xl mt-1 mb-2" />

                <div className="flex justify-between xl:w-full">
                    <div className="flex justify-center">
                        <div className="relative flex rounded-md items-stretch w-auto">

                        </div>


                    </div>

                    <div>


                    <button className="ml-2 inline-flex items-center px-6 py-2 bg-dark-blue hover:bg-indigo-600 text-white 
                    text-sm font-medium rounded-md" type="button" onClick={() => setIsOpen(true)}>
                    <BsPlusCircleFill />&nbsp;
                        New Department
                    </button>

                </div>

                </div>

                <div className="mx-auto mt-2">
                    <div className="flex flex-col">
                        <div className="overflow-x-auto rounded-t-lg test-height">
                            <div className="inline-block w-full align-middle">
                                <div className="overflow-hidden ">
                                <form className="" onSubmit={formikUpdate.handleSubmit}>
                                    <table className="w-full divide-y divide-gray-200">
                                        <thead className="bg-light-blue">
                                            <tr>
                                                <th scope="col" className="w-[35px] p-2 border border-gray-300 bg-light-blue text-white 
                                                text-xs font-medium uppercase">
                                                    No
                                                </th>
                                                <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                                                text-xs font-medium uppercase">
                                                    Name
                                                </th>
                                                <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                                                text-xs font-medium uppercase">
                                                    Manager
                                                </th>
                                                <th scope="col" className="w-[35px] p-2 border border-gray-300 bg-light-blue text-white 
                                                text-xs font-medium uppercase">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="bg-white">
                                            {
                                                listDepartment != null && listDepartment.length > 0 ? (
                                                    listDepartment.map((department: any, index) => {
                                                        return (
                                                            <tr className="hover:bg-gray-100" key={"department-" + index}>

                                                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                                                text-gray-900 border border-gray-300`} style={{textAlign:'center'}}>
                                                                    <span className={` ${(index == currentIndex) && "hidden"}`}>{index + 1}</span>
                                                                </td>

                                                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                                                text-gray-900 border border-gray-300`}>
                                                                <input type="text" className={` ${(index != currentIndex) && "hidden"} 
                                                                    py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 
                                                                    focus:border-gray-300 focus:outline-none bg-table-input text-left`} 
                                                                    name="name"
                                                                    value={formikUpdate.values.name}
                                                                    onChange={formikUpdate.handleChange}
                                                                    onBlur={formikUpdate.handleBlur} />
                                                                    <span className={` ${(index == currentIndex) && "hidden"}`}>{department.name}</span>

                                                                </td>

                                                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                                                text-gray-900 border border-gray-300`}>
                                                                <select id="member-role" className={` ${(index != currentIndex) && "hidden"} 
                                                                    appearance-none block border border-t-0 border-gray-200 text-sm focus:z-10 
                                                                    focus:border-gray-300 focus:outline-none bg-table-input w-full`} 
                                                                    name="manager"
                                                                    value={formikUpdate.values.manager}
                                                                    onChange={formikUpdate.handleChange}
                                                                    onBlur={formikUpdate.handleBlur} >
                                                                    {
                                                                        members != null && members.length > 0 ? (
                                                                            members.map((m: any, index) => {
                                                                            return (
                                                                                <option className='text-left' key={"manager-" + index} value={m.id}>{m.name}</option>
                                                                            )
                                                                            })
                                                                        ) : (<></>)
                                                                    }
                                                                </select>
                                                                    <span className={` ${(index == currentIndex) && "hidden"}`}>{department.employee}</span>

                                                                </td>

                                                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                                                text-gray-900 border border-gray-300`} style={{textAlign:'center'}}>
                                                                    {
                                                                        index == currentIndex ? (
                                                                            <>
                                                                            <a href="#" className="text-base text-blue-600 hover:underline mr-1" 
                                                                                onClick={() => { 
                                                                                $('#btn-update-department').click(); 
                                                                                return false;
                                                                                } } >
                                                                                <FaSave />
                                                                            </a>
                                                                            <button id="btn-update-department" className="hidden items-center px-3 
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
                                                                                setDepartments({
                                                                                    id: department.id,
                                                                                    name: department.name,
                                                                                    manager: department.manager,
                                                                                });
                                                                                formikUpdate.setValues({
                                                                                    id: department.id,
                                                                                    name: department.name,
                                                                                    manager: department.manager,
                                                                                });
                                                                                setCurrentIndex(index);
                                                                                }}>
                                                                                <RiFileEditFill />
                                                                            </a>
                                                                            <a href="#" className="text-base text-red-600 hover:underline float-left mr-1" 
                                                                                onClick={() => { confirmDepartment(department.id) }}>
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
                <span className='text-3xl block float-left'><HiOutlineOfficeBuilding /></span>
                <h1>Add Department</h1>
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
                        Name
                        </span>
                        <input type="text" className={`py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 
                        focus:border-gray-300 focus:outline-none ${formikAdd.errors.name && "error-validate"}`} 
                        name="name" required
                        onChange={formikAdd.handleChange}
                        onBlur={formikAdd.handleBlur}/>
                    </div>

                    <div className="flex relative">
                        <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                        bg-gray-50 text-sm text-gray-500">
                        Manager
                        </span>
                        <div className="w-full relative">
                        <select id="countries" className="appearance-none py-1 px-3 pr-11 block w-full border border-t-0 
                            border-gray-200 text-sm focus:z-10 focus:border-gray-300 focus:outline-none" 
                            name="manager" required
                            onChange={formikAdd.handleChange}
                            onBlur={formikAdd.handleBlur} >
                            <option value="">Select a manager</option>
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
        </>
    )
}
