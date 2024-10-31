import { MdOutlineSupervisedUserCircle } from "react-icons/md"
import { FcOk, FcCancel } from "react-icons/fc"



export default function ConfirmBox({data, onClose, onYes, onNo} : any) {
  return (
    <div className='custom-ui'>
      <div className="text-lg flex items-center gap-x-4 cursor-pointer rounded-md">
        <span className='text-3xl block float-left'>{data.icon}</span>
        <h1>{data.title}</h1>
      </div>

      <div className='mt-3 xl:w-[500px] text-center'>
        {data.message}
      </div>

      <div className='mt-6 flex justify-between'>
        <button className="inline-flex items-center px-3 py-2 text-gray-800 border border-gray-300
          text-sm font-medium rounded-md" type="button" onClick={() => {onNo(); onClose();}}>
          <span className='text-xl block float-left mr-2'><FcCancel /></span> No
        </button>

        <button className="inline-flex items-center px-3 py-2 text-gray-800 border border-gray-300
          text-sm font-medium rounded-md" type="button" onClick={() => {onYes(); onClose();}}>
          <span className='text-xl block float-left mr-2'><FcOk /></span> Yes
        </button>
      </div>
    </div>
  )
}


