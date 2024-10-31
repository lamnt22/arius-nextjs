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


export default function Customer() {
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
      name: '',
      code: '',
      type: '',
      description: '',
    },
    onSubmit: (target: any) => {
      if (target.type == "") {
        target.type = "JP";
      }

      fetch("/api/customer/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: target.name,
          code: target.code,
          type: target.type,
          description: target.description
        }),
      }).then(async (res) => {
        setLoading(false);
        if (res.status === 200) {
          searchCustomer();
          setIsOpen(false);
          setMessage("");
          toast.success("Create customer successfully.");
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

  const [ customer, setCustomer ] = useState({
    id: '',
    name: '',
    code: '',
    type: '',
    description: '',
  });


  const formikUpdate = useFormik({
    initialValues: customer,
    enableReinitialize: true,

    onSubmit: (target: any) => {

      fetch("/api/customer/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: target.id,
          name: target.name,
          code: target.code,
          type: target.type,
          description: target.description
        }),
      }).then(async (res) => {
        if (res.status === 200) {
          searchCustomer();
          setCurrentIndex(-1);
          toast.success("Update customer information successfully.");
        } else {
          toast.error(await res.text());
          setCustomer(target);
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

  const [customers, setCustomers] = useState([]);
  const searchCustomer = async () => {

    const queryString = objToQueryString({
      keyword: $("#keyword").val(),
      page: page,
    });
    fetch(`/api/customer/list?${queryString}`, { 
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(async (res: any) => {
      let data = await res.json();
      setTotal(data.total);
      setMaxResults(data.maxResults);
      setCustomers(data.customers);
    });
  };


  // Init search
  useEffect(() => {
    searchCustomer();
  }, [page]);


  const confirmCustomer = async (id: any) => {

    const data = {
      icon: <MdOutlineSupervisedUserCircle />,
      title: "Customer Delete",
      message: "Are you sure want to delete this customer?"
    }

    confirmAlert({
      customUI: ({ onClose}) => {
        return (
          <ConfirmBox data={data} onClose={onClose} onYes={() => deleteCustomer({id})} onNo={() => console.log("NO")} />
        );
      }
    });
  };

  const deleteCustomer = ({ id } : any) => {
    
    fetch("/api/customer/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id
      }),
    }).then(async (res) => {
      if (res.status === 200) {
        searchCustomer();
        setCurrentIndex(-1);
        toast.success("Delete customer information successfully.");
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
          <h1>CUSTOMERS</h1>
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
                flex items-center" type="button" onClick={() => searchCustomer()}>
                <FiSearch />
              </button>
            </div>
              
            <button className="ml-2 btn px-2 py-2 font-medium text-base leading-tight uppercase 
              rounded-md  hover:bg-gray-700 hover:text-white border border-gray-300 bg-white
              flex items-center" type="button" onClick={() => {$("#keyword").val(""); searchCustomer();}}>
              <MdOutlineClear />
            </button>
          </div>

          <div>
            <button className="ml-2 inline-flex items-center px-6 py-2 bg-dark-blue hover:bg-indigo-600 text-white 
              text-sm font-medium rounded-md" type="button" onClick={() => setIsOpen(true)}>
              <BsPlusCircleFill />&nbsp;
              New Customer
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
                            Customer Name
                          </th>
                          <th scope="col" className="w-[90px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Code
                          </th>
                          <th scope="col" className="w-[75px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                            Type
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
                          customers != null && customers.length > 0 ? (
                            customers.map((customer: any, index) => {
                              return (
                                <tr className="hover:bg-gray-100" key={"customer-" + index}>
                                  <td className="p-2 border border-gray-300 text-center">
                                    <div className="flex items-center">
                                      <input id="checkbox-table-1" type="checkbox" className="w-4 h-4 rounded 
                                        border-gray-300" />
                                      <label htmlFor="checkbox-table-1" className="sr-only">checkbox</label>
                                      <input type="hidden" name="id" value={customer.id} />
                                    </div>
                                  </td>
  
                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`}>
                                    <span className={` ${(index == currentIndex) && "hidden"}`}>{customer.name}</span>
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
                                    <span className={` ${(index == currentIndex) && "hidden"}`}>{customer.code}</span>
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
                                    <span className={` ${(index == currentIndex) && "hidden"}`}>{customer.type}</span>
                                    <select id="countries" className={` ${(index != currentIndex) && "hidden"} 
                                      appearance-none block border border-t-0 border-gray-200 text-sm focus:z-10 
                                      focus:border-gray-300 focus:outline-none bg-table-input `} 
                                      name="type"
                                      value={formikUpdate.values.type}
                                      onChange={formikUpdate.handleChange}
                                      onBlur={formikUpdate.handleBlur}>
                                      <option value="JP">Japan</option>
                                      <option value="VN">Vietnam</option>
                                      <option value="US">America</option>
                                      <option value="EU">Euro</option>
                                      <option value="OT">Others</option>
                                    </select>
                                  </td>
  
                                  <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`}>
                                    <span className={` ${(index == currentIndex) && "hidden"}`}>{customer.description}</span>
                                    <input type="text" className={` ${(index != currentIndex) && "hidden"} 
                                        py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 
                                        focus:border-gray-300 focus:outline-none bg-table-input 
                                        ${formikUpdate.errors.description && "error-validate"}`} 
                                      name="description"
                                      value={formikUpdate.values.description}
                                      onChange={formikUpdate.handleChange}
                                      onBlur={formikUpdate.handleBlur} 
                                      placeholder={formikUpdate.errors.description && formikUpdate.errors.description}  />
                                  </td>
  
                                  <td className="p-2 text-sm font-normal text-right border border-gray-300">
                                    {
                                      index == currentIndex ? (
                                        <>
                                          <a href="#" className="text-base text-blue-600 hover:underline float-left ml-2" 
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
                                              setCustomer(customer);
                                              formikUpdate.setValues({
                                                id: customer.id,
                                                name: customer.name,
                                                code: customer.code,
                                                type: customer.type,
                                                description: customer.description
                                              });
                                              setCurrentIndex(index);
                                            }}>
                                              <RiFileEditFill />
                                          </a>
                                          <a href="#" className="text-base text-red-600 hover:underline mr-2" 
                                            onClick={() => { confirmCustomer(customer.id) }}>
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


        <div id="modals" />

        <Modal isOpen={isOpen} ariaHideApp={false} onRequestClose={() => setIsOpen(false)} style={customModalStyles}>
          <div className="text-lg flex items-center gap-x-4 cursor-pointer rounded-md">
            <span className='text-3xl block float-left'><MdOutlineSupervisedUserCircle /></span>
            <h1>Customer Information</h1>
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
                  Customer Name
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
                  Type
                </span>
                <div className="w-full relative">
                  <select id="countries" className="appearance-none py-1 px-3 pr-11 block w-full border border-t-0 
                      border-gray-200 text-sm focus:z-10 focus:border-gray-300 focus:outline-none" 
                      name="type"
                      onChange={formikAdd.handleChange}
                      onBlur={formikAdd.handleBlur} >
                    <option value="JP">Japan</option>
                    <option value="VN">Vietnam</option>
                    <option value="US">America</option>
                    <option value="EU">Euro</option>
                    <option value="OT">Others</option>
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
      </div>
    </>
  );
}
