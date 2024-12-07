import { Button } from "@/components/ui/button";
import { auth } from '@clerk/nextjs/server'
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
import Navbar from "@/components/ui/Navbar";

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
      {/* Navbar Component */}
      <Navbar />

      <MaxWidthWrapper className='mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center'>
        <div className='mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-gray-200 bg-white px-7 py-2 shadow-md backdrop-blur transition-all hover:border-gray-300 hover:bg-white/50'>
          <p className='text-sm font-semibold text-gray-700'>
            Know PDF is now public!
          </p>
        </div>
        <h1 className='max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl'>
          Chat with your{' '}
          <span className='text-blue-600'>documents</span>{' '}
          in seconds.
        </h1>
        <p className='mt-5 max-w-prose text-zinc-700 sm:text-lg'>
          Join millions of students, researchers, and professionals to instantly
          answer questions and understand research with AI.
        </p>

        <div className="flex mt-2">
          {isAuth && firstChat && (
            <>
              <Link href={`/chat/${firstChat.id}`}>
                <Button>
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
      {/* Rest of the content remains the same */}
      <div>
        {/* Your other content here */}
      </div>
    </>
  );
}
