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

export default function ExpenseBudget() {
    const [expenseBudgets, setExpenseBudgets] = useState([]);
    const [expenseBudgetsEdit, setExpenseBudgetsEdit] = useState([]);

    const getexpenseBudgets = async () => {

        fetch(`/api/expensebudget/list`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        }).then(async (res: any) => {
            let data = await res.json();
            setExpenseBudgets(data.expenseBudgets);
        });
    };

    // Init search
    useEffect(() => {
        getexpenseBudgets();
    }, []);

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [currentIndex, setCurrentIndex] = useState(-1);

    const changeValue = (item: any, value: any) => {
        let resultList: any = expenseBudgets;
        for (var i = 0; i < resultList?.length; i++) {
            let expenseBudget: any = resultList[i];
            if (expenseBudget.id == item.id) {
                resultList[i].value = value;
            }
        }
        setExpenseBudgetsEdit(resultList);
    }

    const save = () => {
        console.log(expenseBudgetsEdit);

        let percent = 0;
        for (var i = 0; i < expenseBudgetsEdit.length; i++) {
            let expenseBudget: any = expenseBudgetsEdit[i];
            percent += Number(expenseBudget.value);
        }

        if (percent > 100) {
            toast.error("Percent không được quá 100%.");
        }

        for (var i = 0; i < expenseBudgetsEdit.length; i++) {
            let expenseBudget: any = expenseBudgetsEdit[i];
            fetch("/api/expensebudget/edit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: expenseBudget.id,
                    value: expenseBudget.value,
                }),
            }).then(async (res) => {
                if (res.status === 200) {
                    if (Number(i) == Number(expenseBudgetsEdit.length)) {
                        console.log(expenseBudgetsEdit.length)
                        toast.success("Update thành công.");
                    }
                } else {
                    toast.error(await res.text());
                }
            });
        }
    }

    return (
        <>
            <div className={``}>
                <div className="text-lg flex items-center gap-x-4 cursor-pointer rounded-md">
                    <span className='text-3xl block float-left'><MdOutlineSupervisedUserCircle /></span>
                    <h1>Expense Budget</h1>
                </div>
            </div>

            <div className="mx-auto mt-2">
                <div className="flex flex-col">
                    <div className="overflow-x-auto rounded-t-lg test-height">
                        <div className="inline-block w-full align-middle">
                            <div className="overflow-hidden ">

                                <form className="">
                                    <table className="w-full divide-y divide-gray-200">
                                        <thead className="bg-light-blue">
                                            <tr>
                                                <th scope="col" className="w-[260px] p-2 border border-gray-300 bg-light-blue text-white 
                                                text-xs font-medium uppercase">
                                                    Type
                                                </th>
                                                <th scope="col" className="w-[90px] p-2 border border-gray-300 bg-light-blue text-white 
                                                text-xs font-medium uppercase">
                                                    Percent (%)
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="bg-white">
                                            {
                                                expenseBudgets != null && expenseBudgets.length > 0 ? (
                                                    expenseBudgets.map((expenseBudget: any, index) => {
                                                        return (
                                                            <tr className="hover:bg-gray-100" key={"customer-" + index}>
                                                                <input type="hidden" name="id" value={expenseBudget.id} />

                                                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                                                text-gray-900 border border-gray-300`}>
                                                                    <span className={` ${(index == currentIndex) && "hidden"}`}>{expenseBudget.type}</span>
                                                                    {/* <input type="text" className={` ${(index != currentIndex) && "hidden"} 
                                                                    py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 
                                                                    focus:border-gray-300 focus:outline-none bg-table-input 
                                                                    ${formikUpdate.errors.key && "error-validate"}`}
                                                                        name="key"
                                                                        value={formikUpdate.values.key}
                                                                        onChange={formikUpdate.handleChange}
                                                                        onBlur={formikUpdate.handleBlur}
                                                                        placeholder={formikUpdate.errors.key && formikUpdate.errors.key} /> */}
                                                                </td>

                                                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                                                text-gray-500 text-center border border-gray-300`}>
                                                                    <input type="text" className={`py-1 px-3 pr-11 block w-full border border-gray-200 text-sm focus:z-10 text-center 
                                                                    focus:border-gray-300 focus:outline-none`}
                                                                        name="value"
                                                                        defaultValue={expenseBudget.value}
                                                                        onChange={(e) => changeValue(expenseBudget, e.target.value)} />
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
                                    <div className='mt-3 flex justify-end'>
                                        <button className="inline-flex items-center px-3 py-2 bg-arius-green hover:bg-light-green text-white 
                                        text-sm font-medium rounded-md" type="button" onClick={save}
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
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}