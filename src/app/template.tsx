// 페이지 이동마다 다시 마운트되어 부드러운 fade/slide 전환을 만든다.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-up">{children}</div>;
}
