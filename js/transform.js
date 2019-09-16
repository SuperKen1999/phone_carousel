!(function (window) {
    window.damu = {};
    window.damu.css = function (obj, name, value) {
        if (typeof obj === "object" && typeof obj["transform"] === 'undefined') {
            obj["transform"] = {};
        }
        if (arguments.length >= 3) {
            //setting
            let text = "";
            obj["transform"][name] = value;
            for (let key in obj["transform"]) {
                switch (key) {
                    case 'translateX':
                    case 'translateY':
                        text += `${key}(${obj["transform"][key]}px) `;
                        break;
                    case 'scale':
                        text += `${key}(${obj["transform"][key]}) `;
                        break;
                    case 'rotate':
                    case 'skewX':
                    case 'skewY':
                        text += `${key}(${obj["transform"][key]}deg) `;
                        break;
                    default:
                        delete obj["transform"][key];
                        break;
                }
            }
            obj.style.transform = obj.style.webkitTransform = text;
        } else if (arguments.length == 2) {
            //read
            value = obj["transform"][name];
            if (typeof value === 'undefined') {
                switch (name) {
                    case 'scale':
                        value = 1;
                        break;
                    default:
                        value = 0;
                        break;
                }
            }
            return value;
        }
    }
    window.damu.carousel=function (picArr) {
        var carouselWrap = document.querySelector('.carousel-wrap');
        console.log(carouselWrap.getAttribute('autogo'))
        if (carouselWrap) {
            //布局-----------------
            {
                //style--pic
                let arr = picArr.concat(picArr);
                let styleNode = document.createElement('style');
                styleNode.innerHTML = `
                .carousel-wrap{
                    position:relative;
                }
                .carousel-wrap>.list {
                    list-style: none;
                    width: ${picArr.length*2*100}%;
                    overflow: hidden;
                    position:absolute;
                }
                .carousel-wrap>.list>li {
                    float: left;
                    width: ${100/picArr.length/2}%;
                }
                .carousel-wrap>.list>li>a,
                .carousel-wrap>.list>li>a>img {
                    display: block;
                }
                .carousel-wrap>.list>li>a>img {
                    width: 100%;
                }
                `
                document.head.appendChild(styleNode);
                //html--pic
                let ulNode = document.createElement('ul');
                ulNode.setAttribute('class', 'list');
                for (let item of arr) {
                    ulNode.innerHTML += `<li><a href="javascript:;"><img src="./img/${item}" alt=""></a></li>`
                }
                carouselWrap.appendChild(ulNode);
                //carousel-wrap的高度
                let img = document.querySelector('.carousel-wrap>.list>li>a>img');
                setTimeout(function () {
                    carouselWrap.style.height = `${img.offsetHeight}px`
                }, 100)

                //底部按钮
                var pointWrap = carouselWrap.querySelector('.point-wrap');
                if (pointWrap) {
                    //style--point
                    let styleNode2 = document.createElement('style');
                    styleNode2.innerHTML = `
                    .carousel-wrap > .point-wrap{
                        position:absolute;
                        bottom:0;
                        z-index:1;
                        width:100%;
                        text-align:center;
                    }
                    .carousel-wrap > .point-wrap > span{
                        display:inline-block;
                        width:10px;
                        height:10px;
                        border-radius:50%;
                        background-color:${pointWrap.getAttribute('data-befColor')};
                        margin-left:5px;
                        transition:.3s;
                    }
                    .carousel-wrap > .point-wrap > span.active{
                        background-color:${pointWrap.getAttribute('data-activeColor')};
                    }
                    `
                    document.head.appendChild(styleNode2);
                    //html--point
                    for (let key in picArr) {
                        if (key == 0) {
                            pointWrap.innerHTML += `<span class='active'></span>`
                        } else {
                            pointWrap.innerHTML += `<span></span>`
                        }
                    }
                }

            }
            //滑屏
            {
                //手指点击的位置
                let startX = 0;
                //元素位置
                let eleX = 0;
                //ul总体
                let list = carouselWrap.querySelector('.carousel-wrap>.list');
                //底部按钮
                let point = carouselWrap.querySelectorAll('.carousel-wrap > .point-wrap > span');
                let clientWidth = document.documentElement.clientWidth;
                //---
                let autogo = carouselWrap.getAttribute('autogo');
                //自动轮播
                let timer = null;

                carouselWrap.addEventListener('touchstart', function (ev) {
                    clearInterval(timer);
                    ev = ev || event;
                    //无缝
                    //点击第一组第一张--瞬间-->跳到第二组第一张
                    //点击第二组最后一张--瞬间-->跳到第一组最后一张
                    let num = -damu.css(list, 'translateX') / clientWidth;
                    if (num == 0) {
                        num = picArr.length;
                    } else if (num == picArr.length * 2 - 1) {
                        num = picArr.length - 1;
                    }
                    damu.css(list, 'translateX', -num * clientWidth)


                    startX = ev.changedTouches[0].clientX;
                    eleX = damu.css(list, 'translateX');
                    list.style.transition = 'none';
                })
                carouselWrap.addEventListener('touchmove', function (ev) {
                    ev = ev || event;
                    let nowX = ev.changedTouches[0].clientX;
                    let disX = nowX - startX;
                    damu.css(list, 'translateX', eleX + disX);
                })
                carouselWrap.addEventListener('touchend', function (ev) {
                    ev = ev || event;
                    let index = damu.css(list, 'translateX') / clientWidth;
                    index = Math.round(index);
                    pointChange(-index);
                    list.style.transition = '.5s';
                    damu.css(list, 'translateX', index * clientWidth);
                    if (autogo == 'true') {
                        auto();
                    }
                })
                if (autogo == 'true') {
                    auto();
                }

                function auto() {
                    clearInterval(timer);
                    timer = setInterval(function () {
                        let num = -damu.css(list, 'translateX') / clientWidth;
                        if (num == picArr.length * 2 - 1) {
                            num = picArr.length - 1;
                            list.style.transition = 'none';
                            damu.css(list, 'translateX', -num * clientWidth);
                        }
                        setTimeout(function () {
                            num++;
                            pointChange(num);
                            list.style.transition = '.5s';
                            damu.css(list, 'translateX', -num * clientWidth);
                        }, 50)
                    }, 2000)
                }

                function pointChange(num) {
                    if (pointWrap) {
                        for (let key in picArr) {
                            point[key].className = '';
                        }
                        point[num % picArr.length].className = 'active';
                    }
                }
            }
        }
    }
    //--------------------------------------
})(window)