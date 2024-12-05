import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { auth } from '@clerk/nextjs/server';
import { ArrowRight, LogIn } from 'lucide-react';
import MaxWidthWrapper from '@/components/ui/MaxWidthWrapper';
import SubscriptionButton from '@/components/ui/SubscriptionButton';
import { checkSubscription } from '@/lib/subscription';

import { UserButton } from '@clerk/nextjs';


export default async function Navbar() {
  const { userId } = await auth();
  const isAuth = !!userId;
  const isPro = await checkSubscription();
  

  return (
    <nav className="sticky top-0 z-30 w-full bg-white/75 backdrop-blur-lg border-b border-gray-200">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="text-xl font-bold">
           Know PDF.
          </Link>

       

          <div className="hidden items-center space-x-4 sm:flex">
            {isAuth ? (
              <>
               <SubscriptionButton isPro={isPro} />
                 <div>
                  <UserButton afterSignOutUrl="/" />
                 </div>

        
               
              </>
            ) : (
              <>
                <Link href="/pricing" className="text-gray-600 hover:text-gray-800">
                  Pricing
                </Link>
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">
                    Get started
                    <ArrowRight className="ml-2" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
}
