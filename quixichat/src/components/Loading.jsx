import { useEffect, useState } from "react";

export default function Loading() {

    const _texts = [
        "Poniendo a trabajar a los duendes almacenadores de mensajes...",
        "Cargando la bola de cristal...",
        "Ajustando el sombrero de mago...",
        "Haciendo que los cuervos lleven los mensajes...",
        "Ajustando la varita mágica...",
        "Invocando a los espíritus del chat...",
        "Llamando a los elfos del chat...",
        "Reagrupando a los clanes...",
    ]
    const [text, setText] = useState(_texts[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            const random = Math.floor(Math.random() * _texts.length);
            setText(_texts[random]);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-screen w-screen text-neutral-200 bg-neutral-900 flex flex-col items-center justify-center">
            <svg className="w-24 h-24" width="1024" height="1024" viewBox="293 295 446 456" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M495.000 295.699 C 485.662 296.709,468.048 300.320,457.131 303.462 C 366.145 329.651,300.638 412.570,293.965 510.000 C 290.265 564.016,308.427 618.914,337.794 642.488 C 344.786 648.101,357.292 654.406,366.000 656.709 C 373.988 658.821,395.655 659.049,404.500 657.114 C 439.409 649.476,474.700 628.156,512.284 592.001 C 524.634 580.121,528.839 575.400,527.831 574.550 C 527.649 574.396,523.225 575.405,518.000 576.791 C 509.667 579.002,506.351 579.322,491.000 579.400 C 473.694 579.487,473.395 579.451,464.000 576.195 C 436.444 566.643,416.653 547.018,405.528 518.211 C 385.691 466.846,405.813 405.847,452.668 375.305 C 494.657 347.935,552.786 351.679,608.185 385.322 C 623.055 394.353,633.620 402.584,646.863 415.455 C 670.382 438.316,686.046 463.781,693.676 491.556 C 697.435 505.241,697.276 515.279,693.044 531.482 C 683.388 568.456,661.418 604.714,629.066 637.066 C 585.856 680.276,531.795 707.446,473.000 715.502 C 458.296 717.516,427.280 718.436,415.000 717.222 C 409.775 716.705,405.172 716.569,404.771 716.920 C 403.575 717.966,420.131 727.837,431.712 732.982 C 481.559 755.127,531.297 757.764,582.296 740.964 C 630.239 725.171,670.975 693.758,699.892 650.280 C 740.814 588.753,751.001 514.797,727.872 447.152 C 725.681 440.743,720.585 428.750,716.548 420.500 C 682.997 351.933,620.448 306.129,547.199 296.488 C 536.863 295.127,504.767 294.642,495.000 295.699" stroke="none" fill="currentColor" fillnot-rule="evenodd"></path></svg>
            <h3 className="text-3xl mt-2">QuixiChat</h3>
            <p className="text-neutral-300 mt-6">{text}</p>
        </div>
    );
}
