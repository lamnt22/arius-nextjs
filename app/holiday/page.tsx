"use client"

import LoadingDots from '@/components/loading-dots';
import { useFormik } from 'formik';
import React, { use, useEffect, useState } from 'react'
import { AiFillSave } from 'react-icons/ai';
import { BsPinterest, BsPlusCircleFill } from 'react-icons/bs';
import { MdCancel, MdInterests } from 'react-icons/md';
import Pagination from 'react-js-pagination';
import Modal from 'react-modal';
import toast from "react-hot-toast";
import moment from 'moment';
import { RiDeleteBin2Fill } from 'react-icons/ri';
import ConfirmBox from "../../components/confirm"
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Calendar } from 'primereact/calendar';

export default function Holiday() {

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  const [maxResults, setMaxResults] = useState(10);
  const [listHoliday, setListHoliday] = useState([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);


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

  const getListHoliday = async () => {
    const queryString = objToQueryString({
      page: page,
    });

    fetch(`/api/holiday/list?${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(async (res: any) => {
      let data = await res.json();
      console.log(data);
      setListHoliday(data.listHoliday);
      setTotal(data.total);
      setMaxResults(data.maxResults);
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
      date:'', 
      description: '',
    },
    onSubmit: (target: any) => {
      let holiday = moment.utc(target.date).tz("Asia/Ho_Chi_Minh").format().replace("+07:00", "Z");
      fetch("/api/holiday/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: holiday,
          description: target.description
        }),
      }).then(async (res) => {
        setLoading(false);
        if (res.status === 200) {
          getListHoliday();
          setIsOpen(false);
          setMessage("");
          toast.success("Add holiday information successfully.");
        }else {
          toast.error(await res.text());
        }
      })
    }
  })

  const confirmMember = async (id: any) => {
    console.log(id);
    
    const data = {
      icon: <BsPinterest />,
      title: "Holiday Delete",
      message: "Are you sure want to delete this holiday?"
    }

    confirmAlert({
      customUI: ({ onClose}) => {
        return (
          <ConfirmBox data={data} onClose={onClose} onYes={() => deleteHoliday({id})} onNo={() => console.log("NO")} />
        );
      }
    });
  };

  const deleteHoliday = ({ id } : any) => {
    
    fetch("/api/holiday/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id
      }),
    }).then(async (res) => {
      if (res.status === 200) {
        getListHoliday();
        setCurrentIndex(-1);
        toast.success("Delete holiday successfully.");
      } else {
        toast.error(await res.text());
      }
    });
  }

  useEffect(() => {
    getListHoliday();

  }, [page])

  return (
    <>
      <div className={``}>
        <div className="text-lg flex items-center gap-x-4 cursor-pointer rounded-md">
          <span className='text-3xl block float-left'><MdInterests /></span>
          <h1>HOLIDAY</h1>
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
              New Holiday
            </button>

          </div>

        </div>


        <div className="mx-auto mt-2">
          <div className="flex flex-col">
            <div className="overflow-x-auto rounded-t-lg h-[calc(100vh-210px)]">
              <div className="inline-block w-full align-middle">
                <div className="overflow-hidden ">
                  <table className="w-full divide-y divide-gray-200">
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
                          Dow
                        </th>
                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                        text-xs font-medium uppercase">
                          Description
                        </th>
                        <th scope="col" className="w-[35px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                          
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {
                        listHoliday != null && listHoliday.length > 0 ? (
                          listHoliday.map((h: any, index) => {
                            return (
                              <tr className={"hover:bg-gray-100"} key={"timesheet-" + index}>
                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                  text-gray-900 border border-gray-300`} style={{ textAlign: 'center' }}>
                                  <span className={` ${(index == currentIndex) && "hidden"}`}>{(page - 1) * maxResults + index + 1}</span>
                                </td>
                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                  text-gray-900 border border-gray-300`} style={{ textAlign: 'center' }}>
                                  <span className={` ${(index == currentIndex) && "hidden"}`}>{moment(h.date).format("yyyy/MM/DD")}</span>
                                </td>
                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                  text-gray-900 border border-gray-300 uppercase`} style={{ textAlign: 'center' }}>
                                  <span className={` ${(index == currentIndex) && "hidden"}`}>{moment(h.date).format("ddd")}</span>
                                </td>
                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                  text-gray-900 border border-gray-300`} style={{ textAlign: 'left' }}>
                                  <span className={` ${(index == currentIndex) && "hidden"}`}>{h.description}</span>
                                </td>
                                <td className="p-2 text-sm font-normal text-right border border-gray-300" style={{ textAlign: 'center' }}>
                                  <a href="#" className="text-base text-red-600 hover:underline float-left mr-1" 
                                    onClick={() =>  confirmMember(h.id)}>
                                    <RiDeleteBin2Fill />
                                  </a>
                                </td>
                              </tr>
                            )
                          })
                        ) : (
                          <tr className="">
                            <td colSpan={5} className="p-2 text-sm font-normal text-center border border-gray-300">
                              No Data
                            </td>
                          </tr>
                        )
                      }
                    </tbody>
                  </table>
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
          <span className='text-3xl block float-left'><MdInterests /></span>
          <h1>Add Holiday</h1>
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
                Date
              </span>
              <Calendar
                id="date" showIcon  
                className="calendar-picker cell-calendar-picker search-calendar-picker border border-gray-200"
                dateFormat="yy-mm-dd"
                name='date'
                onChange={formikAdd.handleChange}
              />
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
    </>
  );
}