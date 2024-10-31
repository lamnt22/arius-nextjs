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
import { BsCurrencyExchange, BsPlusCircleFill } from 'react-icons/bs';

import * as cheerio from 'cheerio';
import axios from 'axios';
import moment from 'moment';
import { AiOutlineUpload } from 'react-icons/ai';

export default function Currency() {

    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(1);
    const [maxResults, setMaxResults] = useState(10);
    const [listCurrency, setListCurrency] = useState([]);
    const [currentIndex, setCurrentIndex ] = useState(-1);
    const [exchangeRate, setExchangeRate] = useState([] as any);

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

    const getListCurrency = async () => {
        fetch(`/api/currency/list`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        }).then(async (res: any) => {
            let data = await res.json();
            setTotal(data.total);
            setMaxResults(data.maxResults);
            setListCurrency(data.currencyRate);
        })
    }

    const readDomHtml = async () => {
        const vcbUrl = "https://vietabank.com.vn/tien-ich/ty-gia/ty-gia-ngoai-te.html";

        const header = [
            "code", "name","rateTM","rateCk","rateBan"
        ]
        
        axios
        .get(vcbUrl)
        .then(({data: html}) => {
          const $ = cheerio.load(html);
          const data = [...$("table")].map(table => {
            return [...$(table).find("> tbody > tr")].splice(2,13).map(tr =>
              Object.fromEntries(
                [...$(tr).find("> td")]
                  .map((td, i) => [header[i], $(td).text().trim()])
                  .filter(e => Boolean(e[1]))
              )
            );
          });
 
          console.log(data);
          
          for (let i = 0; i < data.length; i++) {
            const element = data[i];
            element.map((e) => {
                fetch("/api/currency/add", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        currency: e.code,
                        rate: e.rateCk === "-" ? 0 : parseFloat(e.rateCk.replace(",","")),
                        date: new Date()
                    }),
                }).then(async (res) => {
                    let data = await res.json();
                    console.log(data);
                    
                })
            })
          }
          getListCurrency();
        })
        .catch(err => console.error(err));
        
    }
    

    useEffect(() => {
        getListCurrency();
        
    }, [page]);

    return(
        <>
            <div className={``}>
                <div className="text-lg flex items-center gap-x-4 cursor-pointer rounded-md">
                    <span className='text-3xl block float-left'><BsCurrencyExchange /></span>
                    <h1>CURRENCIES</h1>
                </div>

                <hr className="border-1 border-gray-500 drop-shadow-xl mt-1 mb-2" />

                <div className="flex justify-between xl:w-full">
                    <div className="flex justify-center">
                        <div className="relative flex rounded-md items-stretch w-auto">

                        </div>


                    </div>

                    <div>


                    <button className="ml-2 inline-flex items-center px-6 py-2 bg-dark-blue hover:bg-indigo-600 text-white 
                    text-sm font-medium rounded-md" type="button" onClick={() => readDomHtml()}>
                    <AiOutlineUpload />&nbsp;
                        Update
                    </button>

                </div>

                </div>

                <div className="mx-auto mt-2">
                    <div className="flex flex-col">
                        <div className="overflow-x-auto rounded-t-lg test-height">
                            <div className="inline-block w-full align-middle">
                                <div className="overflow-hidden ">

                                    <table className="w-full divide-y divide-gray-200">
                                        <thead className="bg-light-blue">
                                            <tr>
                                                <th scope="col" className="w-[35px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                                                    No
                                                </th>
                                                <th scope="col" className="w-[100px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                                                    currency
                                                </th>
                                                <th scope="col" className="p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                                                    rate (VNĐ)
                                                </th>
                                                <th scope="col" className="w-[150px] p-2 border border-gray-300 bg-light-blue text-white 
                            text-xs font-medium uppercase">
                                                    Date
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="bg-white">
                                            {
                                                listCurrency != null && listCurrency.length > 0 ? (
                                                    listCurrency.map((currency: any, index) => {
                                                        return (
                                                            <tr className="hover:bg-gray-100" key={"currency-" + index}>

                                                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`} style={{textAlign:'center'}}>
                                                                    <span className={` ${(index == currentIndex) && "hidden"}`}>{index + 1}</span>
                                                                </td>

                                                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`} style={{textAlign:'center'}}>
                                                                    <span className={` ${(index == currentIndex) && "hidden"}`}>{currency.currency}</span>

                                                                </td>

                                                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`} style={{textAlign:'right'}}>
                                                                    <span className={` ${(index == currentIndex) && "hidden"}`}>{currency.rate}</span>

                                                                </td>

                                                                <td className={` ${(index == currentIndex) ? "p-table-input" : "p-2"} text-sm font-normal 
                                    text-gray-900 border border-gray-300`} style={{textAlign:'center'}}>
                                                                    <span className={` ${(index == currentIndex) && "hidden"}`}>{moment(currency.date).format("YYYY/MM/DD")}</span>

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

                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}
