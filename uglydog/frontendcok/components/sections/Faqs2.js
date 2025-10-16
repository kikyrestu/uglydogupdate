import Accordion1 from "../elements/Accordion1"

export default function Faqs2() {
    return (
        <>

            <section id="faq" className="tf-section FAQs">
                <div className="overlay">
                </div>
                <div className="container ">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="tf-title" data-aos="fade-up" data-aos-duration={800}>
                                <h2 className="title">
                                    frequently asked questions
                                </h2>
                            </div>
                        </div>
                        <div className="col-md-12">
                            <Accordion1 />
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
