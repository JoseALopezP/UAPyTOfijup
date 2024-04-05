import { AddBlock } from "./components/addBlock";

export default function Admin() {
    useEffect(() => {
      if (user == null) router.push("/signin")
    }, [user])
    return (
      <>
        <AddBlock/>
      </>
    )
}