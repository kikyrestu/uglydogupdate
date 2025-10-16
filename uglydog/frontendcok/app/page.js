import Layout from "@/components/layout/Layout"
import Chartview from "@/components/sections/Chartview"
import Faqs2 from "@/components/sections/Faqs2"
import Feature2 from "@/components/sections/Feature2"
import Pagetitle3 from "@/components/sections/Pagetitle3"
import Partner3 from "@/components/sections/Partner3"
import Supported from "@/components/sections/Supported"
import Threestep from "@/components/sections/Threestep"
import UglyDogGameLayout from "@/components/uglydog/UglyDogGameLayout"
export default function App() {

    return (
        <>
            <Layout headerStyle={1} footerStyle={1}>
                <Pagetitle3 />
                <section className="py-8 md:py-12 bg-transparent">
                  <UglyDogGameLayout />
                </section>
                <Feature2 />
                <Threestep />
                <Chartview />
                <Partner3 />
                <Faqs2 />
                <Supported />
            </Layout>
        </>
    )
}