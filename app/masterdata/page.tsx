"use client"

import React, { useEffect, useState } from 'react'
import Modal from 'react-modal';

import $ from "jquery"
import { useFormik } from 'formik';
import * as yup from 'yup';

import Pagination from "react-js-pagination";


import LoadingDots from "@/components/loading-dots";

import toast from "react-hot-toast";

import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

import { MdOutlineSupervisedUserCircle } from "react-icons/md"
import { FiSearch } from "react-icons/fi"
import { MdOutlineClear, MdCancel } from "react-icons/md"
import { RiFileEditFill, RiDeleteBin2Fill } from "react-icons/ri"
import { BsPlusCircleFill } from "react-icons/bs"
import { AiFillSave } from "react-icons/ai"
import { FaSave } from "react-icons/fa"

import ConfirmBox from "../../components/confirm"

export default function MasterData() {
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(1);
    const [maxResults, setMaxResults] = useState(10);

    function objToQueryString(obj: any) {
        const keyValuePairs = [];
        for (const key in obj) {
            keyValuePairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
        }
        return keyValuePairs.join('&');
    }

    const [masterDatas, setMasterDatas] = useState([]);
    const getMasterDatas = async () => {

        const queryString = objToQueryString({
            page: page,
        });
        fetch(`/api/masterdata/list?${queryString}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        }).then(async (res: any) => {
            let data = await res.json();
            setTotal(data.total);
            setMaxResults(data.maxResults);
            setMasterDatas(data.insightMaster);
        });
    };

    // Init search
    useEffect(() => {
        getMasterDatas();
    }, [page]);

    const handlePagination = async (page: any) => {
        setPage(page);
    }
    const [isOpen, setIsOpen] = React.useState(false)
    const customModalStyles = {
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)'
        },
        content: {
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
            key: '',
            value: '',
            description: '',
        },
        onSubmit: (target: any) => {
            fetch("/api/masterdata/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    key: target.key,
                    value: target.value,
                    description: target.description
                }),
            }).then(async (res) => {
                setLoading(false);
                if (res.status === 200) {
                    setIsOpen(false);
                    setMessage("");
                    toast.success("Create customer successfully.");
                    getMasterDatas();
                } else {
                    setMessage(await res.text());
                }
            });
        },
        validationSchema: yup.object({
            key: yup.string().trim().required('Required'),
            value: yup.string().trim().required('Required'),
        }),
    });

    const [currentIndex, setCurrentIndex] = useState(-1);

    const [masterdata, setMasterData] = useState({
        id: '',
        key: '',
        value: '',
        description: '',
    });
    const formikUpdate = useFormik({
        initialValues: masterdata,
        enableReinitialize: true,

        onSubmit: (target: any) => {

            fetch("/api/masterdata/edit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: target.id,
                    key: target.key,
                    value: target.value,
                    description: target.description
                }),
            }).then(async (res) => {
                if (res.status === 200) {
                    getMasterDatas();
                    setCurrentIndex(-1);
                    toast.success("Update Master Data information successfully.");
                } else {
                    toast.error(await res.text());
                    setMasterData(target);
                }
            });
        },
        validationSchema: yup.object({
            key: yup.string().trim().required('Required'),
            value: yup.string().trim().required('Required'),
        }),
    });

    const confirmMasterData = async (id: any) => {

        const data = {
            icon: <MdOutlineSupervisedUserCircle />,
            title: "Customer Delete",
            message: "Are you sure want to delete this master data?"
        }

        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <ConfirmBox data={data} onClose={onClose} onYes={() => deleteMasterData({ id })} onNo={() => console.log("NO")} />
                );
            }
        });
    };

    const deleteMasterData = ({ id }: any) => {

        fetch("/api/masterdata/delete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: id
            }),
        }).then(async (res) => {
            if (res.status === 200) {
                getMasterDatas();
                setCurrentIndex(-1);
                toast.success("Delete master data information successfully.");
            } else {
                toast.error(await res.text());
            }
        });
    }
    return (
        <>
            <div className={``}>
                <div className="text-lg flex items-center gap-x-4 cursor-pointer rounded-md">
                    <span className='text-3xl block float-left'><MdOutlineSupervisedUserCircle /></span>
                    <h1>MASTER DATA</h1>
                </div>
            </div>


            <hr className="border-1 border-gray-500 drop-shadow-xl mt-1 mb-2" />

            <div className="flex justify-end xl:w-full">
                <div>
                    <button className="ml-2 inline-flex items-center px-6 py-2 bg-dark-blue hover:bg-indigo-600 text-white 
                    text-sm font-medium rounded-md" type="button" onClick={() => setIsOpen(true)}>
                        <BsPlusCircleFill />&nbsp;
                        New Master Data
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
                                                <th scope="col" className="w-[33px] p-2 border border-gray-300 text-center">
                                                    <div className="flex items-center">
                                                        <input id="checkbox-all" type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                                                        <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                                                    </div>
                                                </th>
                                                <th scope="col" className="w-[260px] p-2 border border-gray-300 bg-light-blue text-white 
                                                text-xs font-medium uppercase">
                                                    Key
                                                </th>
                                                <th scope="col" className="w-[90px] p-2 border border-gray-300 bg-light-blue text-white 
                                                text-xs font-medium uppercase">
                                                    Value
                                                </th>
                                                <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white text-xs 
                                                font-medium uppercase">
                                                    Description
                                                </th>
                                                <th scope="col" className="w-[65px] p-2 border border-gray-300 bg-light-blue text-white 
                                                text-xs font-medium uppercase">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="bg-white">
                                            {
                                                masterDatas != null && masterDatas.length > 0 ? (
                                                    masterDatas.map((masterData: any, index) => {
                                                        return (
                                                            <tr className="hover:bg-gray-100" key={"customer-" + index}>
                                                                <td className="p-2 border border-gray-300 text-center">
                                                                    <div className="flex items-center">
                                                                        <input id="checkbox-table-1" type="checkbox" className="w-4 h-4 rounded 
                                                                        border-gray-300" />
                                                                        <label htmlFor="checkbox-table-1" className="sr-only">checkbox</label>
                                                                        <input type="hidden" name="id" value={masterData.id} />
                                                                    </div>
                                                                </td>

                                                                <td className={`p-2 text-sm font-normal text-gray-900 border border-gray-300`}>
                                                                    <span className={`block w-full`}>{masterData.key}</span>
                                                                </td>

                                                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                                                text-gray-500 text-center border border-gray-300`}>
                                                                    <span className={` ${(index == currentIndex) && "hidden"}`}>{masterData.value}</span>
                                                                    <input type="text" className={` ${(index != currentIndex) && "hidden"} 
                                                                    py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 text-center 
                                                                    focus:border-gray-300 focus:outline-none bg-table-input 
                                                                    ${formikUpdate.errors.value && "error-validate"}`}
                                                                        name="value"
                                                                        value={formikUpdate.values.value}
                                                                        onChange={formikUpdate.handleChange}
                                                                        onBlur={formikUpdate.handleBlur}
                                                                        placeholder={formikUpdate.errors.value && formikUpdate.errors.value} />
                                                                </td>

                                                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                                                text-gray-900 border border-gray-300`}>
                                                                    <span className={` ${(index == currentIndex) && "hidden"}`}>{masterData.description}</span>
                                                                    <input type="text" className={` ${(index != currentIndex) && "hidden"} 
                                                                    py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 
                                                                    focus:border-gray-300 focus:outline-none bg-table-input 
                                                                    ${formikUpdate.errors.description && "error-validate"}`}
                                                                        name="description"
                                                                        value={formikUpdate.values.description}
                                                                        onChange={formikUpdate.handleChange}
                                                                        onBlur={formikUpdate.handleBlur}
                                                                        placeholder={formikUpdate.errors.description && formikUpdate.errors.description} />
                                                                </td>

                                                                <td className="p-2 text-sm font-normal text-right border border-gray-300">
                                                                    {
                                                                        index == currentIndex ? (
                                                                            <>
                                                                                <a href="#" className="text-base text-blue-600 hover:underline float-left ml-2"
                                                                                    onClick={() => {
                                                                                        $('#btn-update-customer').click();
                                                                                        return false;
                                                                                    }} >
                                                                                    <FaSave />
                                                                                </a>
                                                                                <button id="btn-update-customer" className="hidden items-center px-3 
                                                                                py-2 bg-gray-400 hover:bg-gray-600 text-white text-sm font-medium 
                                                                                rounded-md" type="submit">
                                                                                    <FaSave />
                                                                                </button>
                                                                                <a href="#" className="text-base text-red-600 hover:underline mr-2"
                                                                                    onClick={() => {
                                                                                        setCurrentIndex(-1);
                                                                                    }}>
                                                                                    <MdCancel />
                                                                                </a>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <a href="#" className="text-base text-blue-600 hover:underline float-left ml-2"
                                                                                    onClick={() => {
                                                                                        setMasterData(masterData);
                                                                                        setCurrentIndex(index);
                                                                                        formikUpdate.setValues({
                                                                                            id: masterData.id,
                                                                                            key: masterData.key,
                                                                                            value: masterData.value,
                                                                                            description: masterData.description
                                                                                        });
                                                                                    }}>
                                                                                    <RiFileEditFill />
                                                                                </a>
                                                                                {
                                                                                    masterData.change_flag == 1 &&
                                                                                    <a href="#" className="text-base text-red-600 hover:underline mr-2"
                                                                                        onClick={() => { confirmMasterData(masterData.id) }}>
                                                                                        <RiDeleteBin2Fill />
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


            <div id="modals" />

            <Modal isOpen={isOpen} ariaHideApp={false} onRequestClose={() => setIsOpen(false)} style={customModalStyles}>
                <div className="text-lg flex items-center gap-x-4 cursor-pointer rounded-md">
                    <span className='text-3xl block float-left'><MdOutlineSupervisedUserCircle /></span>
                    <h1>Master Data Information</h1>
                </div>

                <div hidden={message == ""} className="mt-2 mb-2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative text-sm"
                    role="alert">
                    <span className="block sm:inline">{message}</span>
                </div>

                <form className="" onSubmit={formikAdd.handleSubmit}>
                    <div className='mt-3 xl:w-[500px]'>
                        <div className="flex">
                            <span className="input-label px-4 inline-flex items-center border border-r-0 border-gray-200 
                            bg-gray-50 text-sm text-gray-500">
                                Key
                            </span>
                            <input type="text" className={`py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 
                            focus:border-gray-300 focus:outline-none ${formikAdd.errors.key && "error-validate"}`}
                                name="key"
                                onChange={formikAdd.handleChange}
                                onBlur={formikAdd.handleBlur} placeholder={formikAdd.errors.key && formikAdd.errors.key} />
                        </div>

                        <div className="flex">
                            <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                            bg-gray-50 text-sm text-gray-500">
                                Value
                            </span>
                            <input type="text" className={`py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                            focus:z-10 focus:border-gray-300 focus:outline-none ${formikAdd.errors.value && "error-validate"}`}
                                name="value"
                                onChange={formikAdd.handleChange}
                                onBlur={formikAdd.handleBlur} placeholder={formikAdd.errors.value && formikAdd.errors.value} />
                        </div>

                        <div className="flex">
                            <span className="input-label px-4 inline-flex items-center border border-r-0 border-t-0 border-gray-200 
                            bg-gray-50 text-sm text-gray-500">
                                Description
                            </span>
                            <input type="text" className="py-1 px-3 pr-11 block w-full border border-t-0 border-gray-200 text-sm 
                            focus:z-10 focus:border-gray-300 focus:outline-none"
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
        </>
    )
}