export default function Chartview() {
    return (
        <>
            <section id="chart" className="tf-section tf_chart">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="tf-title" data-aos="fade-up" data-aos-duration={800}>
                                <h2 className="title">
                                    Ugly Dog Chart View
                                </h2>
                            </div>
                        </div>
                        <div className="col-md-12">
                            <div className="chart-wrapper style3" data-aos="fade-up" data-aos-duration={800}>
                                <iframe height="600px" width="100%" id="geckoterminal-embed" title="GeckoTerminal Embed" src="https://www.geckoterminal.com/id/solana/pools/DpymEBbhDzVMV3NJTKbbVhHzY7zbgLcFYi7EzGHzqtRF?embed=1&info=1&swaps=1&grayscale=0&light_chart=0&chart_type=price&resolution=15m" frameBorder="0" allow="clipboard-write" allowFullScreen></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}