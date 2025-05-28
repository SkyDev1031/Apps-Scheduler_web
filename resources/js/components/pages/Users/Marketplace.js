import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBitqueryTemplateSettings, productApi } from '../../api/OriginAPI.js';
import { Image, NumberView } from "../../components";
import { DEF_IMAGE, _ERROR_CODES } from "../../config";
import { useGlobalContext } from "../../contexts";
import { marketplace_path, toast_error } from "../../utils";

const Marketplace = () => {

    const [isMarketplace, setMarketplace] = useState(false);
    const [data, setData] = useState([])
    const { setLoading } = useGlobalContext();
    const navigate = useNavigate();
    useEffect(() => {
        getData();
        getTemplateSettings();
    }, [getData])

    const getData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await productApi();
            setData(res.marketplace);
        } catch (error) {
            toast_error(error, _ERROR_CODES.NETWORK_ERROR)
        } finally {
            setLoading(false);
        }
    }, [data])
    const getTemplateSettings = useCallback(async () => {
        try {
            let res = await getBitqueryTemplateSettings();
            // console.log("Marketplace getTemplateSettings res = : ", res);
            if (res.success) {
                setMarketplace(res.data.isMarketplace === 1 ? true : false);
            }
        } catch (error) {
            console.log("User Marketplace getTemplateSettings error === : ", error);
            toast_error("Invalid Server Connection!");
        }
    }, [])
    const typeOfItem = {
        'Physical': 'Physical', 'DigitalBuyNow': 'Digital Buy Now', '7Days': '7 Days Access', '30Days': '30 Days Access'
    }

    return (
        <div className="marketplace-container">
            <section className="latest-articles posts blog-4">
                <div className="overlay pb-120">
                    <div className="container" style={{ position: "relative" }}>
                        {isMarketplace ?
                            <div className="row">
                                <h4 className="title">Popular Posts</h4>
                                {data?.map(item => (
                                    <div key={item.id} className="col-lg-4 mb-30">
                                        <div className="marketplace-item zoom">
                                            {item.Feature == 'Y' &&
                                                <div className="feature-item">Featured</div>
                                            }
                                            <div className="text-center">
                                                <Image src={marketplace_path(item.Image1)} def={DEF_IMAGE.marketplace} />
                                                <h6 className="success-text">{item.ProductName}</h6>
                                                <hr />
                                                <div className="description">{item.Description}</div>
                                                <hr />
                                                <div className="details">
                                                    <NumberView value={item.Price} decimal={2} prefix={'$'} color={"#00a654"} />
                                                    <p className="success-text">{typeOfItem[item.TypeOfItem]}</p>
                                                </div>
                                                {item.Quantity == 0 ?
                                                    <h6 className="mt-30" style={{ height: 40 }}>Out of Stock !</h6>
                                                    :
                                                    <button className="cmn-btn btn-sm mt-30" onClick={() => navigate(`/user/marketplace/buy/${item.id}`)}> View Now</button>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            :
                            <div className="row">
                                <h4 className="title mt-5">Coming Soon!</h4>
                            </div>
                        }
                    </div>
                </div>
            </section>
        </div>
    )
}
export default Marketplace;