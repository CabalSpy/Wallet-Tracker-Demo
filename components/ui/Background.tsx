export function Background() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div style={{
        position:'absolute',inset:0,
        backgroundImage:`linear-gradient(rgba(0,214,143,0.016) 1px,transparent 1px),linear-gradient(90deg,rgba(0,214,143,0.016) 1px,transparent 1px)`,
        backgroundSize:'54px 54px',
        maskImage:'radial-gradient(ellipse 90% 55% at 50% 0%,black 0%,transparent 75%)',
        WebkitMaskImage:'radial-gradient(ellipse 90% 55% at 50% 0%,black 0%,transparent 75%)',
      }}/>
      <div style={{
        position:'absolute',top:'-15%',left:'50%',transform:'translateX(-50%)',
        width:'1000px',height:'520px',
        background:'radial-gradient(ellipse,rgba(0,214,143,0.05) 0%,transparent 65%)',
      }}/>
    </div>
  )
}
