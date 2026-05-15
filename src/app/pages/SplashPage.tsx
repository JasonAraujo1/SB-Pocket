import { useNavigate } from "react-router";
import sbLogo from "../../assets/C_pia_de_PADR_O_SB_LAYOUT_ONEPAGES__1080_x_1080_px_.png";
import imagePhoneIAF from "../../assets/imagePhoneIAF.gif";
import { COLORS } from "../constants/colors";
import { ROUTES } from "../routes/routes";

export function SplashPage() {
  const navigate = useNavigate();

  return (
    <div
      className="w-full h-full flex flex-col text-white"
      style={{
        backgroundColor: COLORS.teal,
        backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.12), rgba(0,0,0,0) 45%)",
      }}
    >
      <div className="px-6 pt-8 pb-2">
        <div className="inline-flex items-center gap-2">
          <img src={sbLogo} alt="" className="w-7 h-7 rounded" />
          <div className="flex flex-col leading-tight">
            <span className="text-white/70 tracking-wider" style={{ fontSize: "9px" }}>GRUPO</span>
            <span className="text-white/70">SB monteiro</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 px-6">
        <h1 className="text-white mx-[0px] mt-[0px] mb-[-20px]" style={{ fontSize: "40px" }}>SB Pocket</h1>
        <p className="text-white/85">by Setor de TI</p>
        <img src={imagePhoneIAF} alt="" className="h-72 w-auto object-contain mt-2" />
      </div>

      <div className="w-full flex flex-col items-center gap-3 px-8 pb-10">
        <button
          onClick={() => navigate(ROUTES.login)}
          className="w-full max-w-xs bg-white rounded-full py-4"
          style={{ color: COLORS.teal }}
        >
          Começar
        </button>
        <p className="text-white/70 text-center max-w-[220px]">
          Informações relevantes sempre com você
        </p>
      </div>
    </div>
  );
}
