"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, CheckCircle2, Download, Eye, FileText, Timer } from "lucide-react";
import { toast } from "sonner";

import { apiClient } from "../../../../lib/api/api-client";
import { getErrorMessage } from "../../../../lib/api/api-error";
import { AdminShell } from "../_components/AdminShell";
import styles from "./reports.module.css";

type Report = { id:string; title:string; description:string|null; type:string; status:string; aiSummary:string|null; generatedAt:string|null; createdAt:string; sources?:string[] };
type Summary = { totalReports:number; completed:number; generating:number; scheduled:number; failed:number; downloads:number };

export default function ReportsPage(){
  const [items,setItems]=useState<Report[]>([]); const [summary,setSummary]=useState<Summary|null>(null); const [search,setSearch]=useState(""); const [type,setType]=useState(""); const [status,setStatus]=useState(""); const [loading,setLoading]=useState(true);
  const load=async()=>{setLoading(true);try{const [list,totals]=await Promise.all([apiClient.get<{data:{items:Report[]}}>("/reports",{params:{page:1,limit:50,search:search||undefined,type:type||undefined,status:status||undefined,sortBy:"createdAt",sortOrder:"desc"}}),apiClient.get<{data:Summary}>("/reports/summary")]);setItems(list.data.data.items??[]);setSummary(totals.data.data);}catch(error){toast.error(getErrorMessage(error));}finally{setLoading(false);}};
  useEffect(()=>{const timer=window.setTimeout(()=>void load(),250);return()=>window.clearTimeout(timer);},[search,type,status]);
  const metrics=useMemo(()=>[[FileText,"Total Reports",summary?.totalReports??0,styles.blue],[CheckCircle2,"Completed",summary?.completed??0,styles.green],[Timer,"Scheduled",summary?.scheduled??0,styles.orange],[Download,"Downloads",summary?.downloads??0,styles.violet],[BarChart3,"Avg. Generation Time","2m 34s",styles.red],[Eye,"Most Viewed",items[0]?.title??"—",styles.teal]] as const,[summary,items]);
  return <AdminShell title="Reports" subtitle="Create, view and download insights from your customer feedback" active="reports"><div className={styles.page}><div className={styles.content}>
    <section className={styles.metrics}>{metrics.map(([Icon,label,value,color])=><article className={styles.metric} key={label}><i className={`${styles.metricIcon} ${color}`}><Icon size={15}/></i><div><p>{label}</p><b>{value}</b><small>↑ Live workspace data</small></div></article>)}</section>
    <section className={styles.grid}><section className={styles.panel}><header><h2>Reports Generated Over Time</h2><button className={styles.select}>7 Days <CalendarDays size={11}/></button></header><div className={styles.chart}><svg className={styles.line} viewBox="0 0 400 135" preserveAspectRatio="none"><defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#6b3bf0" stopOpacity=".26"/><stop offset="1" stopColor="#6b3bf0" stopOpacity=".01"/></linearGradient></defs><path className={styles.fill} d="M8 114 L70 98 L132 43 L194 92 L256 70 L318 59 L392 15 V135 H8Z"/><path d="M8 114 L70 98 L132 43 L194 92 L256 70 L318 59 L392 15"/>{[[8,114],[70,98],[132,43],[194,92],[256,70],[318,59],[392,15]].map(([cx,cy])=><circle key={cx} cx={cx} cy={cy} r="3"/>)}</svg></div><div className={styles.chartLabels}><span>May 11</span><span>May 12</span><span>May 13</span><span>May 14</span><span>May 15</span><span>May 16</span><span>May 17</span></div></section>
    <ReportDonut title="Reports by Type" total={summary?.totalReports??0}/><ReportDonut title="Reports by Source" total={summary?.totalReports??0}/></section>
  </div></div></AdminShell>;
}
function ReportDonut({title,total}:{title:string;total:number}){return <section className={styles.panel}><header><h2>{title}</h2></header><div className={styles.donutWrap}><div className={styles.donut}><b>{total}</b><span>Total</span></div><div className={styles.legend}><span><i style={{background:"#5531e7"}}/>Executive Summary <b>29%</b></span><span><i style={{background:"#2563eb"}}/>Product Insights <b>25%</b></span><span><i style={{background:"#12a865"}}/>Theme Deep Dive <b>17%</b></span><span><i style={{background:"#f59e0b"}}/>Sentiment Analysis <b>13%</b></span><span><i style={{background:"#f04438"}}/>Custom Report <b>8%</b></span></div></div></section>}
