import { Button } from "@/components/ui/button";
import {auth } from '@clerk/nextjs/server'
import Link from "next/link";
import { ArrowRight, LogIn } from "lucide-react";
import FileUpload from "@/components/ui/FileUpload";
import { checkSubscription } from "@/lib/subscription";
import SubscriptionButton from "@/components/ui/SubscriptionButton";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import MaxWidthWrapper from '@/components/ui/MaxWidthWrapper';
import Image from "next/image";
import { UserButton }  from '@clerk/nextjs'

export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;
  const isPro = await checkSubscription();
  let firstChat;
  if (userId) {
    firstChat = await db.select().from(chats).where(eq(chats.userId, userId));
    if (firstChat) {
      firstChat = firstChat[0];
    }
  }




  return (
<>
  <MaxWidthWrapper className="mb-12 mt-20 sm:mt-37 flex flex-col items-center justify-center text-center">
    <div className="mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-gray-200 bg-white px-7 py-2 shadow-md backdrop-blur transition-all hover:border-gray-300 hover:bg-white/50">
      <p className="text-sm font-semibold text-gray-700">
        Chat with Document
      </p>
    </div>
    <UserButton afterSignOutUrl="/" />
    <h1 className="max-w-4xl text-3xl font-bold md:text-2xl lg:text-3xl">
    Instantly explore and gain insights from your documents with <span className="text-[#33679c]">AI-powered chat</span>, all in seconds.

    </h1>
    <p className="mt-5 max-w-prose text-zinc-700 sm:text-lg">
    Join countless students, researchers, and professionals in quickly finding answers and gaining insights from research using AI.
    </p>
    <div className="flex mt-2">
      {isAuth && firstChat && (
        <>
          <Link href={`/chat/${firstChat.id}`}>
            <Button className="bg-[#33679c]">
              Go to Chats <ArrowRight className="ml-2" />
            </Button>
          </Link>
          <div className="ml-3">
            <SubscriptionButton isPro={isPro} />
          </div>
        </>
      )}
    </div>
    <div className="w-full mt-4">
      {isAuth ? (
        <FileUpload />
      ) : (
        <Link href="/sign-in">
          <Button>
            Get Started!
            <LogIn className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      )}
    </div>
  </MaxWidthWrapper>
  <MaxWidthWrapper>
  <div className="flex justify-center items-center my-12">
        <video
          controls
          className="rounded-md shadow-2xl w-full max-w-3xl"
        >
          <source src="/chat-vid.mp4" type="video/mp4" />
          
        </video>
      </div>
  {/* New Section 1 */}
  <div className="flex flex-col-reverse lg:flex-row items-center my-20">
    <div className="lg:w-1/2 text-left px-6">
      <h2 className="text-4xl font-bold mb-4">Read Papers And Take Notes At The Speed of AI</h2>
      <p className="text-lg text-zinc-700">
        Unleash the power of artificial intelligence to revolutionize the way you read and understand complex documents. Summarize any PDF or document instantly with AI. Whether  a student, researcher, or professional, save countless hours and gain deeper insights in record time. Join millions of users worldwide who are transforming their workflows and simplifying research tasks like never before.
      </p>
    </div>
    <div className="lg:w-1/2 px-6">
      <Image
        src="/stu.jpeg"
        alt="AI Speed"
        width={500}
        height={500}
        className="rounded-md shadow-2xl"
      />
    </div>
  </div>

  {/* New Section 2 */}
  <div className="my-20">
    <h2 className="text-4xl font-bold text-center mb-8">
      Why Choose Scruby AI?
    </h2>
    <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8">
      <div className="flex-1 border rounded-lg p-6 shadow-md">
        <h3 className="text-2xl font-semibold mb-2">AI Summarizer</h3>
        <p className="text-lg text-zinc-700">
          Get precise, concise summaries of lengthy PDFs and documents in seconds. Save time and focus on what truly matters while Scruby AI distills essential information for you.
        </p>
      </div>
      <div className="flex-1 border rounded-lg p-6 shadow-md">
        <h3 className="text-2xl font-semibold mb-2">Personal Research Assistant</h3>
        <p className="text-lg text-zinc-700">
          Stay organized and productive with your personal AI-powered assistant. Streamline note-taking, categorize ideas, and focus on insights to achieve your goals effortlessly.
        </p>
      </div>
      <div className="flex-1 border rounded-lg p-6 shadow-md">
        <h3 className="text-2xl font-semibold mb-2">Efficient Workflow</h3>
        <p className="text-lg text-zinc-700">
          Simplify and enhance your workflow by seamlessly managing research materials. Scruby AI ensures a smooth experience from start to finish, helping you stay ahead of deadlines.
        </p>
      </div>
    </div>
  </div>

  {/* New Section 3 */}
  <div className="flex flex-col lg:flex-row items-center my-20">
    <div className="lg:w-1/2 px-6">
      <Image
        src="/stu2.jpeg"
        alt="Note Taking"
        width={500}
        height={500}
        className="rounded-md shadow-2xl"
      />
    </div>
    <div className="lg:w-1/2 text-left px-6">
      <h2 className="text-4xl font-bold mb-4">Take Notes With AI</h2>
      <p className="text-lg text-zinc-700">
        Transform the way you take notes with cutting-edge AI tools. Effortlessly capture critical insights from research papers, lectures, or meetings. Organize your thoughts with ease and keep track of key ideas without missing a beat. Let Scruby AI be your ultimate note-taking companion, making every learning experience more productive and enjoyable.
      </p>
    </div>
  </div>

  <div className="flex justify-center items-center my-12">
        <video
          controls
          className="rounded-md shadow-2xl w-full max-w-3xl"
        >
          <source src="/notes-vid.mp4" type="video/mp4" />
          
        </video>
      </div>
  
</MaxWidthWrapper>
 {/* Footer Section */}
 <div className="bg-gray-20 text-black py-8 mt-20">
    <div className="flex justify-between items-center px-6">
      <div className="flex items-center space-x-4">
        <Image
          src="/chat-logo.png"
          alt="Scruby AI Logo"
          width={40}
          height={40}
          className="rounded-full"
        />
        <span className="text-lg font-semibold">Scruby AI</span>
      </div>
      <div className="flex space-x-6 text-lg">
        <a href="/contact" className="hover:underline">Contact</a>
        <a href="/blog" className="hover:underline">Blog</a>
        <a href="/privacy" className="hover:underline">Privacy</a>
        <a href="/terms" className="hover:underline">Terms</a>
      </div>
    </div>
    <div className="text-center mt-4 text-sm">
    <span>&copy; {new Date().getFullYear()} Scruby AI. All Rights Reserved.&rsquo;</span>
    </div>
  </div>

  
</>

  );
}