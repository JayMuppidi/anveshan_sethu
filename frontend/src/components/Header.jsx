import {Link} from 'react-router-dom';
import acm_logo from '../assets/acm_logo_tablet.png'

export default function Header({
    heading,
    paragraph,
    linkName,
    linkUrl="#"
}){
    return(
        <div className="mb-10">
            <div className="flex justify-center">
                <img 
                    alt=""
                    // className="h-80 w-225"
                    src={acm_logo}/>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-black dark:text-white">
                {heading}
            </h2>
            <p className="mt-2 text-center text-sm text-black dark:text-white mt-5">
            {paragraph} {' '}
            <Link to={linkUrl} className="font-medium text-blue-400 hover:text-blue-400">
                {linkName}
            </Link>
            </p>
        </div>
    )
}