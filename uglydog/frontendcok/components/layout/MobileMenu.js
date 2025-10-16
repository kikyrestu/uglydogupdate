'use client'
export default function MobileMenu({ isMobileMenu }) {
    return (
        <>
            <nav id="main-nav-mobi" className="main-nav" style={{ display: isMobileMenu ? "block" : "none" }}>
            <ul className="menu">
                <li className="menu-item">
                    <a href="#home">Home</a>
                </li>
                <li className="menu-item">
                    <a href="#feature">Features</a>
                </li>
                <li className="menu-item">
                    <a href="#step">Steps</a>
                </li>
                <li className="menu-item">
                    <a href="#chart">Chart</a>
                </li>
                <li className="menu-item">
                    <a href="#partner">Partners</a>
                </li>
                <li className="menu-item">
                    <a href="#faq">FAQ</a>
                </li>
            </ul>
        </nav>
        </>
    )
}
