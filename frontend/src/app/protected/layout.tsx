import styles from "./protected.module.css";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.shell}>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}