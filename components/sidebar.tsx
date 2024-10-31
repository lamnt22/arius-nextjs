'use client';

import React, { useState } from 'react'
import Image from "next/image";

import { BsArrowLeftShort, BsSearch, BsCurrencyExchange, BsFillDatabaseFill, BsPinterest } from "react-icons/bs"
import { RxDashboard } from "react-icons/rx"
import { GoProject } from "react-icons/go"
import { AiOutlineLogout, AiFillSnippets } from "react-icons/ai"
import { FaChevronDown, FaUserTie, FaInfoCircle, FaPersonBooth, FaRegClock, FaRegMoneyBillAlt } from "react-icons/fa"
import { RiMoneyCnyCircleFill, RiUserSettingsFill } from "react-icons/ri"
import { GiExpense, GiReceiveMoney } from "react-icons/gi"
import { MdInterests, MdOutlineSupervisedUserCircle } from "react-icons/md"
import { HiOutlineOfficeBuilding } from "react-icons/hi"
import { FiSettings } from "react-icons/fi"

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SideBar(props: any) {
  const userRole = props.userRole;
  
  const [sideOpen, setSideOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState<any[]>([]);
  const [active, setActive] = useState(0);

  const router = useRouter();

  const handleOpenMenu = (id: any) => {
    
    if(menuOpen.includes(id)){
        let currentMenuOpen = [...menuOpen];
        currentMenuOpen = currentMenuOpen.filter((_id: any) => _id != id);
        console.log(currentMenuOpen);
        
        setMenuOpen(currentMenuOpen);
    }else{
      let currentMenuOpen: any = [...menuOpen];
      currentMenuOpen.push(id);
      setMenuOpen(currentMenuOpen);
    }
  }

  const setState = (data: any) => {
    setActive(data);
  }

  const SideMenus = [
    {
      id: 1,
      title: "Dashboard",
      icon: <RxDashboard />,
      roles: "ADMIN,MANAGER,USER",
      spacing: false,
      subMenu: false,
      subMenuItems: [],
      onClick: () => {setState(1); router.push("/dashboard");}
    },
    {
      id: 2,
      title: "Projects",
      icon: <GoProject />,
      roles: "ADMIN,MANAGER",
      spacing: false,
      subMenu: true,
      subMenuItems: [
        { title: "Information", icon: <FaInfoCircle />, role:"ADMIN,MANAGER", onClick: () => {setState(2.1); router.push("/project");}, id: 2.1 },
        { title: "Resource Allocation", icon: <FaPersonBooth />, role:"ADMIN,MANAGER", onClick: () => {setState(2.2); router.push("/project/resource-allocation")}, id: 2.2 }
      ],
      onClick: () => {}
    },
    {
      id: 3,
      title: "Members",
      icon: <FaUserTie />,
      roles: "ADMIN,MANAGER,USER",
      spacing: false,
      subMenu: true,
      subMenuItems: [
        {title: "List Member", icon: <FaUserTie />, role:"ADMIN,MANAGER", onClick: () => { setState(3.1); router.push("/member")}, id: 3.1 },
        {title: "Time Sheet", icon: <FaRegClock />, role:"ADMIN,MANAGER,USER", onClick: () => {setState(3.2); router.push("/timesheet")}, id: 3.2 },
        {title: "Salary", icon: <FaRegMoneyBillAlt />, role:"ADMIN", onClick: () => {setState(3.3); router.push("/salary")}, id: 3.3 }
      ],
      onClick: () => {}
    },
    {
      id: 4,
      title: "Finance",
      icon: <RiMoneyCnyCircleFill />,
      roles: "ADMIN",
      spacing: false,
      subMenu: true,
      subMenuItems: [
        { title: "Overview", icon: <AiFillSnippets />, role:"ADMIN", onClick: () => {setState(4.1); router.push("/finance/overview")}, id: 4.1 },
        { title: "Expense", icon: <GiExpense />, role:"ADMIN", onClick: () => {setState(4.2); router.push("/finance/expense")}, id: 4.2 },
        { title: "Income", icon: <GiReceiveMoney />, role:"ADMIN", onClick: () => {setState(4.3); router.push("/finance/income")}, id: 4.3 }
      ],
      onClick: () => {}
    },
    {
      id: 5,
      title: "Settings",
      icon: <FiSettings />,
      roles: "ADMIN",
      spacing: false,
      subMenu: true,
      subMenuItems: [
        { title: "User", icon: <RiUserSettingsFill />, role:"ADMIN", onClick: () => {setState(5.1); router.push("/user")}, id: 5.1 },
        { title: "Customers", icon: <MdOutlineSupervisedUserCircle />, role:"ADMIN", onClick: () => {setState(5.2); router.push("/customer")}, id: 5.2 },
        { title: "Holiday", icon: <MdInterests />, role:"ADMIN", onClick: () => {setState(5.3); router.push("/holiday")}, id: 5.3 },
        { title: "Departments", icon: <HiOutlineOfficeBuilding />, role:"ADMIN", onClick: () => {router.push("/department"); setState(5.4)}, id: 5.4 },
        { title: "Currencies", icon: <BsCurrencyExchange />, role:"ADMIN", onClick: () => {router.push("/currency"); setState(5.5)}, id: 5.5 },
        { title: "Master Data", icon: <BsFillDatabaseFill />, role:"ADMIN", onClick: () => {setState(5.6); router.push("/masterdata")}, id: 5.6 },
        { title: "Budget", icon: <GiExpense />, role:"ADMIN", onClick: () => {setState(5.7); router.push("/expensebudget")}, id: 5.7 }
      ],
      onClick: () => {}
    },

    {
      id: 6,
      title: "Logout",
      icon: <AiOutlineLogout />,
      roles: "ADMIN,MANAGER,USER",
      spacing: false,
      subMenu: false,
      subMenuItems: [],
      onClick: () => signOut(
        { redirect: true }).then(() => {
          router.push("/login"); // Redirect to the login page after signing out
        }
      )
    }
  ];

  return (
    <>
      <div className={`bg-insight-green h-screen p-5 pt-8 ${sideOpen ? "w-[250px]" : "w-20 sidebar-close"} duration-300 relative`}>
        <BsArrowLeftShort id="sileMenu" className={`bg-white text-insight-green text-3xl rounded-full absolute -right-3 top-9 border
        border-insight-green cursor-pointer ${!sideOpen && "rotate-180"} `}
          onClick={() => setSideOpen(!sideOpen)} />

        <div className='inline-flex'>
          <Image
            width={32}
            height={32}
            src="/logo.png"
            alt="Arius Logo"
            className={`bg-white text-4xl rounded cursor-pointer float-left mr-2 w-8 h-8`}
          />
          <h1 className={`text-white origin-left font-medium text-2xl ${!sideOpen && "scale-0"}`}>
            Insight&reg;
          </h1>
        </div>

        <div className={`flex items-center rounded-md bg-white mt-6 ${!sideOpen ? "px-2.5" : "px-4"} py-2`}>
          <BsSearch className={`text-gray-500 text-lg block float-left cursor-pointer ${sideOpen && "mr-2"}`} />
          <input type={"search"} placeholder="Search"
            className={`text-base bg-transparent w-full text-white focus:outline-none ${!sideOpen && "hidden"}`} />
        </div>

        <ul className='pt-2'>
          <li></li>
          {
            SideMenus.map((menu, index) => {
              return(
                <React.Fragment key={index}>
                  {
                    menu.roles.includes(userRole) &&
                    <li key={"sideMenu-" + index} 
                      className={`${(active == menu.id) && "bg-light-white"} text-white text-sm flex items-center gap-x-4 cursor-pointer p-2 
                      hover:bg-light-white rounded-md ${menu.spacing ? "mt-8" : "mt-1"} `} 
                      onClick={() => handleOpenMenu(menu.id)} >
                      <span className='text-2xl block float-left'>
                        { menu.icon ? menu.icon : <RxDashboard /> }
                      </span>
                      <span className={`text-sm font-medium flex-1 duration-200 ${!sideOpen && "hidden"}`}
                        onClick={menu.onClick} >
                        { menu.title }
                      </span>

                      {
                        menu.subMenu && 
                          <FaChevronDown key={"subMenu-expand-" + index} 
                            className={`${menuOpen.includes(menu.id) && "rotate-180"}`} />
                      }
                    </li>
                  }
                  

                  {
                    (menu.subMenu && sideOpen && menuOpen.includes(menu.id)) && 
                      <ul key={"subMenu-" + index} className=''>
                        {
                          menu.subMenuItems.map((subMenu: any, subIndex) => {
                            return (subMenu.role.includes(userRole) &&
                              <li key={"subMenuItem-" + subIndex} 
                                className={`text-white text-sm flex items-center gap-x-4 cursor-pointer p-2 px-5 
                                hover:bg-light-white rounded-md ${(active == subMenu.id) && "bg-light-white"}`} onClick={subMenu.onClick}>
                                <span className='text-xl block float-left'>
                                  { subMenu.icon ? subMenu.icon : <RxDashboard /> }
                                </span>
                                { subMenu.title }
                              </li>
                            )
                          })
                        }
                      </ul>
                  }
                </React.Fragment>
              )
            })
          }
        </ul>
      </div>
    </>
  );
}