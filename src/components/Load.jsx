import pokeball from '../assets/pokeball.svg'

function Load({ sideText }) {
    return (
        <div className={'flex gap-3'}>
            {/*<div className={`size-7 rounded-full border-4 border-b-transparent border-gray-50 animate-spin`}></div>*/}
            <img className={'size-7 animate-spin'} src={pokeball} alt={''} role={'presentation'} />
            {sideText && <div className={'text-xl font-semibold text-gray-50'}>Loading...</div>}
        </div>
    )
}

export default Load;