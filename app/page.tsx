import { redirect } from "next/navigation";

export default function Home() {

  //redirect to firewall
  redirect("/firewall");

  return <></>;
}
