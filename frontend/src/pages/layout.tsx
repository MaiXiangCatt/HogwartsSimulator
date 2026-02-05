import ChatArea from "@/components/chat/ChatArea";

function Layout() {
  return (
    <div className="flex w-full h-screen">
      <div className="w-1/5 bg-gray-200">我是sidebar占位</div>
      <div className="flex flex-col w-4/5">
        <div className="w-full h-1/12 bg-gray-300">我是header占位</div>
        <ChatArea />
      </div>
    </div>
  );
}
export default Layout;
