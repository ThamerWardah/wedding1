import "@fontsource/amiri/400.css";
import "@fontsource/amiri/700.css";
export default function Bg(){
    return(
        <div className="flex w-screen h-screen justify-center items-center flex-wrap gap-8 ">

            <div className=" w-3/4 h-[200px]  rounded-xl bg-gradient-to-r from-amber-100 via-green-200 to-white animate-gradient
            text-2xl text-center flex items-center justify-center font-extrabold shadow-xl shadow-blue-200/70 font-serif
            
            ">



Here is the main text


            </div>

             <div className="w-3/4 h-[200px] rounded-xl bg-[repeating-linear-gradient(45deg,_#fef3c7_0,_#fef3c7_10px,_#fde68a_10px,_#fde68a_20px)]"></div>

             <div className="w-3/4 h-[200px] rounded-xl bg-[repeating-linear-gradient(45deg,_#fef3c7_0,_#fef3c7_10px,_#FAF3E0_10px,_#FAF3E0_20px)]"></div>
             


<div className="relative w-3/4 h-[200px] rounded-xl text-2xl text-center flex items-center justify-center font-extrabold font-serif shadow-xl  shadow-blue-200/70 overflow-hidden">

  <div className=" z-0 absolute inset-0 bg-[url('/h2.jpg')] bg-cover bg-center"></div>

  <div className="relative z-20 text-white">Animated Image + Gradient mix-blend-overlay</div>

  <div className="absolute inset-0 bg-gradient-to-r from-black via-white/20 to-black animate-fog-gradient opacity-90 z-50"></div>

</div>




             


<div className="relative w-3/4 h-[200px] rounded-xl text-2xl text-center flex items-center justify-center font-extrabold font-serif shadow-xl  shadow-blue-200/70 overflow-hidden">

  <div className=" z-0 absolute inset-0 bg-[url('/h2.jpg')] bg-cover bg-center"></div>

  <div className="relative z-20 ">نوع الخط الاساسي</div>

  <div className="absolute inset-0 bg-gradient-to-r from-blue-800 via-rose-300/20 to-green-800 animate-fog-gradient opacity-90 z-50"></div>

</div>













<div className="relative w-3/4 h-[200px] rounded-xl text-2xl text-center flex items-center justify-center font-extrabold font-serif shadow-xl shadow-blue-200/70 overflow-hidden">

  <div className=" z-0 absolute inset-0 bg-[url('/h2.jpg')] bg-cover bg-center"></div>

  <div className="relative z-20  text-black" style={{fontFamily: "Amiri, serif"}}>نوع الخط الاساسي</div>


<div className="absolute inset-0 bg-gradient-to-tr from-black via-white/20 to-black animate-fog-gradient3  opacity-90 z-50"></div>

</div>


<div>#FAF3E0  #F5F5DC   #F3E5AB #E8D3B9 #D2B48C</div>

        </div>
    )
}