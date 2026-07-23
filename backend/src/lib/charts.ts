export interface ChartData { labels: string[]; datasets: { label: string; data: number[] }[] }
export function generateBarChart(labels: string[], values: number[], label: string): ChartData {
  return { labels, datasets: [{ label, data: values }] };
}
export function generatePieChart(labels: string[], values: number[]): ChartData {
  return { labels, datasets: [{ label: "Distribution", data: values }] };
}
export function generateLineChart(labels: string[], series: { label: string; data: number[] }[]): ChartData {
  return { labels, datasets: series };
}
