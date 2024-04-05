import SignIn from "./components/signin";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <SignIn/>
    </main>
  );
}
