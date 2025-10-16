
import Link from "next/link"

export default function Partner3() {
    return (
        <>

            <section id="partner" className="tf-section tf_partner">
                <div className="overlay">
                </div>
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="tf-title" data-aos="fade-up" data-aos-duration={800}>
                                <h2 className="title">
                                    Our Partners
                                </h2>
                            </div>
                        </div>
                        <div className="col-md-12">
                            <div className="partner-wrapper style3" data-aos="fade-up" data-aos-duration={800}>
                                <Link href="https://www.coingecko.com/en/coins/ugly-dog" className="image">
                                    <img src="/assets/images/partner/01.png" alt="CoinGecko" />
                                </Link>
                                <Link href="https://www.ascendex.com/" className="image">
                                    <img src="/assets/images/partner/02.png" alt="AscendEX" />
                                </Link>
                                <Link href="https://v2.raydium.io/swap/?inputCurrency=sol&outputCurrency=74Rq6Bmckiq8qvARhdqxPfQtkQsxsqVKCbDQL5PKpump" className="image">
                                    <img src="/assets/images/partner/03.png" alt="Raydium" />
                                </Link>
                                <Link href="https://app.meteora.ag/pools/CafWuKH9pji8LJ7QmQjtG4VZqqGJP6aNf3F1kbyzSxt6" className="image">
                                    <img src="/assets/images/partner/04.png" alt="Meteora" />
                                </Link>
                                <Link href="https://www.orca.so/?tokenIn=So11111111111111111111111111111111111111112&tokenOut=74Rq6Bmckiq8qvARhdqxPfQtkQsxsqVKCbDQL5PKpump" className="image">
                                    <img src="/assets/images/partner/05.png" alt="Orca" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
