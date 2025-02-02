import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image";

interface CarouselOrientationProps {
    video: string;
    title: string;
    description: string;
}

export function CarouselOrientation({ arr }: { arr: Array<CarouselOrientationProps> }) {
    return (
        <Carousel
            opts={{
                align: "center",
            }}
            orientation="horizontal"
            className="w-full justify-center items-center "
        >
            <CarouselContent className="-mt-1 h-[250px]">
                {arr.map((_, index) => (
                    <CarouselItem key={index} className="pt-1 md:basis-1/2">
                        <div className="p-3">
                            <Card>
                                <CardContent className="flex items-center justify-center p-6">
                                    <Image src={_.video} alt={_.title} height={512} width={512} />
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    )
}
