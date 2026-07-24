import { Navigate, useParams } from "react-router-dom";
import LinuxLab from "./LinuxLab";
import SqlLab from "./SqlLab";
import SubnetLab from "./SubnetLab";
import PromptLab from "./PromptLab";

export default function AiLab() {
  const { domainId } = useParams();

  if (domainId === "linux") return <LinuxLab />;
  if (domainId === "bdd") return <SqlLab />;
  if (domainId === "reseaux") return <SubnetLab />;
  if (domainId === "ia") return <PromptLab />;

  return <Navigate to="/ai-lab" replace />;
}
