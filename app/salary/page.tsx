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
import { FaRegMoneyBillAlt, FaSave } from "react-icons/fa"

import ConfirmBox from "../../components/confirm"
import moment from 'moment';
import { Calendar } from 'primereact/calendar';
import { useRouter } from 'next/navigation';

import "primereact/resources/themes/lara-light-indigo/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";                                //icons

export default function Salary() {

    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(1);
    const [maxResults, setMaxResults] = useState(10);
    const [fromDate, setFromDate] = useState(new Date());

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

    const [employeeSalaryMonthly, setEmployeeSalaryMonthly] = useState([]);
    const searchSalary = async () => {

        const queryString = objToQueryString({
            keyword: $("#keyword").val(),
            page: page,
        });
        fetch(`/api/salary/list?${queryString}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        }).then(async (res: any) => {
            let data = await res.json();
            setTotal(data.total);
            setMaxResults(data.maxResults);
            setEmployeeSalaryMonthly(data.employeeSalaryMonthly);
        });
    };

    const [isOpen, setIsOpen] = React.useState(false);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [message, setMessage] = useState("");
    const [checkSide, setCheckSide] = useState(true);

    const changeTable = () => {
        $(document).on("click","#sileMenu", (e) => {
            // alert("Slide successfull!");
            var slide = $(".child").find(".sidebar-close");
            if(slide.length > 0){
                setCheckSide(false);
            }else {
                setCheckSide(true);
            }
       })
    }

    // Init search
    useEffect(() => {
        searchSalary();
        changeTable();
        console.log(employeeSalaryMonthly);
        
    }, [page]);

    const isValidDate = (date:any) =>{
        return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
    }

    const caculateSalaryByMonth = () => {
        if(isValidDate(fromDate)){
            const queryString = objToQueryString({
                pay_time: moment(fromDate).format("MM/yyyy")
            });
            fetch(`/api/salary/caculate?${queryString}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            }).then(async (res) => {
                if (res.status === 200) {
                    toast.success("Caculate salary employee by month successfully.");
                    searchSalary();
                } else {
                    toast.error(res.statusText);
                }
                
            }); 
        }else{
            toast.error("Invalid date time");    
        }
    }

    return (
        <>
            <div className={``}>
                <div className="text-lg flex items-center gap-x-4 cursor-pointer rounded-md">
                    <span className='text-3xl block float-left'><FaRegMoneyBillAlt /></span>
                    <h1>SALARY</h1>
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
                             <Calendar
                                    id="from-date" placeholder='From' showIcon showButtonBar
                                    className={`calendar-picker cell-calendar-picker search-calendar-picker border border-r-0 border-gray-300`}
                                    view={"month"}
                                    dateFormat="yy-mm"
                                    value={fromDate}
                                    onChange={(e: any) => setFromDate(e.value)}
                            />
                            <button className="btn px-2.5 py-2 font-medium text-base leading-tight uppercase
                rounded-r-md hover:bg-gray-500 hover:text-white border border-gray-300 bg-white
                flex items-center" type="button" onClick={() => searchSalary()}>
                                <FiSearch />
                            </button>
                        </div>

                        <button className="ml-2 btn px-2 py-2 font-medium text-base leading-tight uppercase 
              rounded-md  hover:bg-gray-700 hover:text-white border border-gray-300 bg-white
              flex items-center" type="button" onClick={() => { $("#keyword").val(""); searchSalary(); }}>
                            <MdOutlineClear />
                        </button>
                    </div>
                    
                </div>

                <div className="mx-auto mt-2">
                    <div className="">
                        <div className={`overflow-x-auto rounded-t-lg test-height ${checkSide ? "w-[calc(100%-245px)]" : "w-[calc(100%-80px)]"}`}>
                            <table className="divide-y divide-gray-200">
                                <thead className="bg-light-blue">
                                    <tr>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                                        text-xs font-medium uppercase" colSpan={12}>Thông tin nhân viên</th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                                        text-xs font-medium uppercase" colSpan={10}>LƯƠNG THỎA THUẬN</th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                                        text-xs font-medium uppercase" colSpan={7}>Ngày công</th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                                        text-xs font-medium uppercase" colSpan={6}>LƯƠNG VỊ TRÍ CÔNG VIỆC THEO NGÀY CÔNG</th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                                        text-xs font-medium uppercase" colSpan={3}>LƯƠNG LÀM THÊM GIỜ 
                                        (nếu có)</th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                                        text-xs font-medium uppercase" colSpan={10}>CÁC KHOẢN THU NHẬP/GIẢM TRỪ KHÁC</th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                                        text-xs font-medium uppercase" rowSpan={3}>Tổng thu nhập</th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                                        text-xs font-medium uppercase" colSpan={3}>BHXH, BHYT, BHTN</th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                                        text-xs font-medium uppercase" colSpan={2}>KINH PHÍ CÔNG ĐOÀN</th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                                        text-xs font-medium uppercase" colSpan={4}>CÁC KHOẢN MIỄN GIẢM THUẾ TNCN</th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                                        text-xs font-medium uppercase" rowSpan={3}>Tổng thu nhập chịu thuế</th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                                        text-xs font-medium uppercase" colSpan={5}>CÁC KHOẢN GIẢM TRỪ KHI TÍNH THUẾ TNCN</th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                                        text-xs font-medium uppercase" rowSpan={3}>Thu nhập tính thuế</th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                                        text-xs font-medium uppercase" colSpan={4}>THUẾ TNCN</th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                                        text-xs font-medium uppercase" colSpan={4}>THỰC LĨNH</th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                                        text-xs font-medium uppercase" colSpan={2}>Thanh toán</th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                                        text-xs font-medium uppercase" rowSpan={3}>TỔNG CHI PHÍ LƯƠNG, THƯỞNG</th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                                        text-xs font-medium uppercase" rowSpan={3}>Note</th>
                                    </tr>

                                    <tr>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            STT
                                        </th>
                                        <th scope="col" className="border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Mã nhân viên
                                        </th>
                                        <th scope="col" className="  border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Member
                                        </th>
                                        <th scope="col" className="  border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Email
                                        </th>
                                        <th scope="col" className="  border border-gray-300 bg-light-blue text-white text-xs 
                    font-medium uppercase" rowSpan={2}>
                                            Đơn giá
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white text-xs 
                    font-medium uppercase" rowSpan={2}>
                                            Vị trí
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white text-xs 
                    font-medium uppercase" rowSpan={2}>
                                            Job Family
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Job Code 
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Ngày vào công ty 
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Hình thức LĐ-tính thuế
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Cam kêt miễn thuế
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Code 
                                        </th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" colSpan={3}>
                                            Nhân viên thử việc/CTV/thực tập
                                        </th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" colSpan={7}>
                                            Nhân viên chính thức
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Ngày công chuẩn
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Ngày công học việc/CTV
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Ngày công thử việc
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Ngày công chính thức
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Ngày công CTV/thử việc trước  điều chỉnh 
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Ngày công CT trước điều chỉnh 
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Tổng ngày công
                                        </th>

                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Lương ngày công học việc/CTV
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Lương ngày công thử việc
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Lương thử việc/CTV trước điều chỉnh
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Lương ngày công chính thức
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Lương chính thức trước điều chỉnh
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Tổng lương theo ngày công
                                        </th>

                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Tổng lương OT-tính thuế
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Tổng lương OT-không tính thuế
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Tổng lương thêm giờ
                                        </th>

                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Thưởng Trách nhiệm
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Khác (Bù trừ lương tháng...) trong thu nhập chịu thuế
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" colSpan={2}>
                                            Thanh toán phép tồn
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Hỗ trợ nhà ở  
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Thưởng (Doanh số, Hiệu quả, Thành tích đặc biệt,…)/Trợ cấp thai sản từ Công ty
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Lương OT vượt định mức
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Khác
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Lương tháng 13/Bonus
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Tổng cộng
                                        </th>

                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Mức lương đóng BHXH
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase">
                                            NlĐ
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" >
                                            CTY
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase">
                                            NlĐ
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" >
                                            CTY
                                        </th>

                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Hỗ trợ điện thoại
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Hỗ trợ ăn trưa  
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Tiền OT miễn thuế 
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Tổng cộng
                                        </th>

                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Giảm trừ bản thân
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" colSpan={2}>
                                            NPT
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase">
                                            Bảo hiểm
                                        </th>

                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Tổng cộng các khoản giảm trừ thuế TNCN
                                        </th>

                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" colSpan={2}>
                                            Thuế TNCN phát sinh trong tháng
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Truy thu/truy lĩnh thuế TNCN (nếu có)
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Tổng cộng
                                        </th>

                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Tổng thu nhập sau thuế
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Các khoản trừ ngoài lương(-)(tạm ứng lương...)
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Các khoản cộng ngoài lương (+)
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            LƯƠNG THỰC NHẬN
                                        </th>

                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Giữ lương
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                    text-xs font-medium uppercase" rowSpan={2}>
                                            Chuyển khoản
                                        </th>
                                    </tr>

                                    <tr>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">Lương CTV/thử việc trước điều chỉnh</th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">Lương học việc/CTV</th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">Lương thử việc</th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">Lương gross</th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">Lương theo vị trí công việc</th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">Thưởng hiệu suất</th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">Hỗ trợ xăng xe</th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">Hỗ trợ điện thoại</th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">Hỗ trợ ăn trưa</th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">Lương gross trước điều chỉnh </th>

                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">Số ngày phép tồn</th>
                                        <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">Thành tiền</th>

                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                                            10.5%
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                                            21.5%
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                                            0%
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                                            0%
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                                            NPT
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                                            Thành tiền giảm trừ NPT
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                                            10.50%
                                        </th>

                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                                            Thuế luỹ tiến
                                        </th>
                                        <th scope="col" className=" border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                                            Thuế 10%
                                        </th>
                                    </tr>


                                    <tr>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase'></td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase'></td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase'></td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase'></td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase'></td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase'></td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase'></td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase'></td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase'></td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase'></td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase'></td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase'></td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase' style={{textAlign: 'center'}}>VNĐ</td>
                                        <td className='border border-gray-300 bg-light-blue text-white text-xs font-medium uppercase'></td>
                                    </tr>

                                </thead>

                                <tbody className="bg-white">

                                <tr>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>1</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>2</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>3</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>4</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>5</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>6</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>7</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>8</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>9</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>10</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>11</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>12</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>13</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>14</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>15</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>16</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>17</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>18</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>19</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>20</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>21</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>22</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>23</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>24</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>25</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>26</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>27</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>28</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>29</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>30</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>31</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>32</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>33</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>34</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>35</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>36</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>37</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>38</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>39</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>40</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>41</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>42</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>43</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>44</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>45</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>46</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>47</td> 
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>48</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>49</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>50</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>51</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>52</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>53</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>54</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>55</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>56</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>57</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>58</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>59</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>60</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>61</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>62</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>63</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>64</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>65</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>66</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>67</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>68</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>69</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>70</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>71</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>72</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>73</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>74</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300' style={{textAlign: 'center'}}>75</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                    </tr>       
                                    
                                    <tr>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>1</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>FA001</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>Member A</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>$400000</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>Nhân viên</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>DEV</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>01/11/2023</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>Chính thức</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>ON</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>15000000</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>5500000</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>7770000</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>500000</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>500000</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>730000</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>23.00</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>23.00</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>23.00</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>0</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>0</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>0</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>15000000</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>0</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>15000000</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td> 
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>15000000</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>5500000</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>577500</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>1182500</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>500000</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>730000</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>1230000</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>13770000</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>11000000</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>1</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>4400000</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>577500</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>15977500</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>14422500</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>14422500</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>14422500</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'>14422500</td>
                                        <td className='p-2 text-sm font-normal text-gray-900 border border-gray-300'></td>
                                    </tr>                                   
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
        </>
    );
}