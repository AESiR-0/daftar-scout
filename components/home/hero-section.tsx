"use client"
import Image from 'next/image'
import React, { useState } from 'react'
import bullet from '@/public/static/landing/header_bullet.png'
import { Modal } from '../Modal'
export function HeroSection() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    return (
        <header className="text-left z-1 py-5 px-5">
            <h1 className="text-4xl md:text-4xl">
                <span className='flex items-center justify-between'>
                    <span className="flex items-center">
                        <Image className='scale-50' src={bullet} alt='bullet' width={64} height={64} />
                        <span className=''>
                            <span className='text-blue-500'>Daftar</span> Operating System
                        </span></span>
                    <span onClick={() => setIsModalOpen(true)} className="text-white flex items-center hover:scale-95 py-2 px-2 transition-all duration-300 hover:cursor-pointer bg-blue-500 text-lg  rounded-md">
                        Our Story
                    </span>
                </span>
            </h1>
            <p className="text-gray-400 mt-4 px-16 pr-40 text-lg flex justify-start mx-auto">
                Whether you're a founder pitching your startup idea to the world or an investor scouting opportunities globally,
                Daftar Operating System supports you in making more informed decisions with storytelling that hyper focuses on
                intent and data-driven insights.
            </p>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="flex mb-2 flex-col gap-5 items-center justify-center">
                    <h2 className='text-2xl   text-blue-500 font-bold '>Our Story</h2>
                    <video controls loop autoPlay src="https://example.com/video.mp4" height={500} width={700} />
                </div>
            </Modal>
        </header>
    )
} 