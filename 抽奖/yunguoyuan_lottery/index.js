// 实例化Vue
let vm = new Vue({
    el: "#yunguoyuan_lottery",

    // 使用组件
    components: {
    },
    data() {
        return {
            // 抽奖数据
            prizes: [],

            // 背景
            blocks: [
                { padding: '10px', background: 'rgba(0, 0, 0, 1)', borderRadius: '10px' },
            ],
            buttons: [{
                x: 1, 
                y: 1,
                background: 'rgba(0, 0, 200, 1)',
                fonts: [
                    { text: '剩余次数:???次', fontColor: 'yellow', top: '50%' }
                ]
            }],
            defaultStyle: {
                fontColor: 'red',
                fontSize: '10px',
                lineHeight: '13px',
                wordWrap: false
            },
            activeStyle: {
                fontColor: '#fff',
            }
        }
    },
    mounted() {
        this.getPrizesList()
    },
    methods: {
        getPrizesList() {
            const prizes = []
            let axis = [[0,0],[0,1],[0,2],[1,0],[1,2],[2,0],[2,1],[2,2]];
            let data = [
                { name: 'steam游戏任选\n(限款)', top: '50%' },
                { name: '百元京东卡', top: '50%' },
                { name: '暴雪游戏30点数', top: '50%' },
                { name: '云币2888', top: '50%' },
                { name: '手游月卡', top: '50%' },
                { name: '连续3日\n手游时长+1h', top: '35%' },
                { name: '手游时长+30min', top: '50%' },
                { name: '端游时长+1h', top: '50%' },
            ]
            data.forEach((item, index) => {
                prizes.push({
                    x: axis[index][0], 
                    y: axis[index][1],
                    title: item.name,
                    background:'pink',
                    fonts: [{ text: item.name, top: item.top }],
                })
            })
            this.prizes = prizes
        },
        startCallBack() {
            this.$refs.LuckDraw.play()
            setTimeout(() => {
                this.$refs.LuckDraw.stop(Math.random() * 8 >> 0)
            }, 2000)
        },
        endCallBack(prize) {
            alert(`恭喜你获得大奖: ${prize.title}`)
        }

    }
})