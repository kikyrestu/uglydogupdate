
'use client'
import AOS from 'aos'
import { useEffect, useState } from "react"
import AddClassBody from "../elements/AddClassBody"
import BackToTop from '../elements/BackToTop'
import DonutProgress from '../elements/DonutProgress'
import PopupBid from "../elements/PopupBid"
import Breadcrumb from './Breadcrumb'
import Footer1 from './footer/Footer1'
import Header1 from "./header/Header1"

export default function Layout({ headerStyle, footerStyle, breadcrumbTitle, children }) {
    const [scroll, setScroll] = useState(0)
    // Moblile Menu
    const [isMobileMenu, setMobileMenu] = useState(false)
    const handleMobileMenu = () => setMobileMenu(!isMobileMenu)

    const [isConnect, setConnect] = useState(false)
    const handleConnect = () => setConnect(!isConnect)

    useEffect(() => {
        AOS.init()

        document.addEventListener("scroll", () => {
            const scrollCheck = window.scrollY > 100
            if (scrollCheck !== scroll) {
                setScroll(scrollCheck)
            }
        })
    }, [])
    return (
        <>
            <AddClassBody />
            <DonutProgress />
            <div id="wrapper">
                {!headerStyle && <Header1 scroll={scroll} isMobileMenu={isMobileMenu} handleMobileMenu={handleMobileMenu} isConnect={isConnect} handleConnect={handleConnect} />}
                {headerStyle == 1 ? <Header1 scroll={scroll} isMobileMenu={isMobileMenu} handleMobileMenu={handleMobileMenu} isConnect={isConnect} handleConnect={handleConnect} /> : null}

                {breadcrumbTitle && <Breadcrumb breadcrumbTitle={breadcrumbTitle} />}

                {children}

                {!footerStyle && < Footer1 />}
                {footerStyle == 1 ? < Footer1 /> : null}
                <PopupBid isConnect={isConnect} handleConnect={handleConnect} />

            </div>
            <BackToTop scroll={scroll} />
        </>
    )
}
