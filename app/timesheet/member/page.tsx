"use client"

import moment from 'moment';
import { useRouter } from 'next/navigation';
import { Calendar } from 'primereact/calendar';
import React, { useEffect, useState } from 'react'
import { FaRegClock, FaHourglass } from 'react-icons/fa';
import Pagination from 'react-js-pagination';

export default function Member() {

  const router = useRouter();

  const [listByMember, setListByMember] = useState([]);
  const [totalHoursMonth, setTotalHoursMonth] = useState(0);
  const [isOpenByMember, setIsOpenByMember] = React.useState(false);
  const [totalDateInMonth, setTotalDateInMonth] = useState(0);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  const [maxResults, setMaxResults] = useState(10);
  const [maxResultsByMember, setMaxResultsByMember] = useState(10);
  const [fromDate, setFromDate] = useState(new Date());

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

  const getListbyMember = () => {
    const queryString = objToQueryString({
      fromMonth: moment(fromDate).format("MM/yyyy"),
      page: page,
    });
    fetch(`/api/timesheet/byMember?${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(async (res: any) => {
      let data = await res.json();
      console.log(data);
      setListByMember(data.getListbyMemeber);
      setTotalHoursMonth(data.totalHoursMonth);
      setIsOpenByMember(true);
      setTotalDateInMonth(data.total);
      setMaxResultsByMember(data.maxResults)
    });
  }

  const searchListbyMember = (event: any) => {
    const queryString = objToQueryString({
      fromMonth: moment(event.value).format("MM/yyyy"),
      page: page,
    });
    fetch(`/api/timesheet/byMember?${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(async (res: any) => {
      let data = await res.json();
      console.log(data);
      setListByMember(data.getListbyMemeber);
      setTotalHoursMonth(data.totalHoursMonth);
      setIsOpenByMember(true);
      setTotalDateInMonth(data.total);
      setMaxResultsByMember(data.maxResults)
    });
  }

  useEffect(() => {
    getListbyMember();

  }, [fromDate, page])

  const [isMemberView, setMemberView] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);


  return (
    <div className={``}>
      <div className="text-lg flex items-center gap-x-4 cursor-pointer rounded-md">
        <span className='text-3xl block float-left'><FaRegClock /></span>
        <h1>TIMESHEET</h1>
      </div>

      <hr className="border-1 border-gray-500 drop-shadow-xl mt-1 mb-2" />

      <div className="flex xl:w-full mb-3">
        <span className={`inline-flex items-center border border-gray-300 px-3 py-1 cursor-pointer ${isMemberView ? "bg-light-blue text-white border-light-blue" : ""} `} onClick={() => {setMemberView(false); router.push("/timesheet")}}>Overview</span>
        <span className={`inline-flex items-center border border-l-0 border-gray-300 px-3 py-1 cursor-pointer ${!isMemberView ? "bg-light-blue text-white border-light-blue" : ""} `} onClick={() => setMemberView(true)}>Member</span>
      </div>

      <div className="flex justify-between xl:w-full">
          <div className="flex justify-center">
            <div className="relative flex rounded-md items-stretch w-auto">
              <div className="w-100 flex-none relative">
                <Calendar
                  id="from-date" placeholder='Month' showIcon showButtonBar
                  className={`calendar-picker cell-calendar-picker search-calendar-picker border
                    border-gray-300`}
                  view={"month"}
                  dateFormat="yy-mm"
                  value={fromDate}
                  onChange={(e: any) => {searchListbyMember(e); setFromDate(e.value)}}
                />
              </div>
            </div>
            <span className='inline-flex items-center ml-3 px-3 bg-gray-200 text-gray-800 rounded-full'>
              <FaHourglass /> &nbsp;Regular Hours: {totalHoursMonth}
            </span>
          </div>

          <div>


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
                      <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                      text-xs font-medium uppercase" rowSpan={2}>
                        Member
                      </th>
                      <th scope="col" className="w-[100px] p-2 border border-gray-300 bg-light-blue text-white 
                      text-xs font-medium uppercase" rowSpan={2}>
                        Total Hours
                      </th><th scope="col" className="w-[100px] p-2 border border-gray-300 bg-light-blue text-white 
                      text-xs font-medium uppercase" rowSpan={2}>
                        Percent
                      </th>
                      <th scope="col" className="w-[70px] p-2 border border-gray-300 bg-light-blue text-white text-xs 
                      font-medium uppercase" rowSpan={2}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {
                      listByMember != null && listByMember.length > 0 ? (
                        listByMember.map((m: any, index) => {
                          return (
                            <tr className={"hover:bg-gray-100"}
                              key={"timesheet-" + index}>
                              <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                              text-gray-900 border border-gray-300`} style={{ textAlign: 'center' }}>
                                <span className={` ${(index == currentIndex) && "hidden"}`}>{(page - 1)*maxResultsByMember + index + 1}</span>
                              </td>
                              <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                              text-gray-900 border border-gray-300`}>
                                <span className={` ${(index == currentIndex) && "hidden"}`}>{m.name}</span>

                              </td>
                              <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                              text-gray-900 border border-gray-300`} style={{ textAlign: 'center' }}>
                                <span className={` ${(index == currentIndex) && "hidden"}`}>{Number(m.total_hours).toFixed(1)}</span>

                              </td>
                              <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                              text-gray-900 border border-gray-300`} style={{ textAlign: 'center' }}>
                                <span className={` ${(index == currentIndex) && "hidden"}`}>{(Number(m.total_hours) / totalHoursMonth * 100).toFixed(0)}%</span>

                              </td>
                              <td className="p-2 text-sm font-normal text-right border border-gray-300" style={{ textAlign: 'center' }}>
                                <span className={` ${(index == currentIndex) && "hidden"}`}
                                  style={((Number(m.total_hours) / totalHoursMonth) * 100) >= Number((totalHoursMonth / 8 - 1) / (totalHoursMonth / 8) * 100) ? { color: 'green' } : { color: 'red' }}>
                                  {((Number(m.total_hours) / totalHoursMonth) * 100) >= Number((totalHoursMonth / 8 - 1) / (totalHoursMonth / 8) * 100) ? "OK" : "NG"}
                                </span>
                              </td>
                            </tr>
                          )
                        })
                      ) : (
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
                totalItemsCount={totalDateInMonth}
                itemsCountPerPage={maxResultsByMember}
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
  )
}