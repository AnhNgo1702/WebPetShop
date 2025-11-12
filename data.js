const products = {
    dog: [
        { id: 1, name: "Chó Chihuahua", price: 3000000, description: "cao khoảng 16-20cm, nặng tầm 1,5-3kg", category: "dog", origin: "Mexico", stock: 5, Image: 'chihuahua.jpg' },
        { id: 2, name: "Chó Bắc Kinh", price: 4000000, description: "cao khoảng 14-26cm, nặng tầm 3-5kg", category: "dog", origin: "Trung Quốc", stock: 8, Image: 'backinh.jpg' },
        { id: 3, name: "Chó Dachshund(lạp xưởng)", price: 3500000, description: "cao khoảng 20-27cm, nặng tầm 7-15kg", category: "dog", origin: "Đức", stock: 10, Image: 'lapxuong.jpg' },
        { id: 4, name: "Chó Phú Quốc", price: 5000000, description: "cao khoảng 48-52cm, nặng tầm 12-18kg", category: "dog", origin: "Việt Nam", stock: 8, Image: 'phuquoc.jpg' },
        { id: 5, name: "Chó Poodle", price: 8000000, description: "cao khoảng 25-40cm, nặng tầm 2-9kg", category: "dog", origin: "Tây Âu", stock: 10, Image: 'poodle.jpg' },
        { id: 6, name: "Chó Pug", price: 15000000, description: "cao khoảng 30-35cm, nặng tầm 8-10kg", category: "dog", origin: "Trung Quốc", stock: 12, Image: 'pug.jpg' },
        { id: 7, name: "Chó Alaska", price: 9800000, description: "cao khoảng 55-70cm, nặng tầm 35-50kg", category: "dog", origin: "Hoa Kỳ", stock: 20, Image: 'alaska.jpg' },
        { id: 8, name: "Chó Husky", price: 7500000, description: "cao khoảng 50-60cm, nặng tầm 16-27kg", category: "dog", origin: "Nga", stock: 25, Image: 'husky.jpg' },
        { id: 9, name: "Chó Shiba", price: 25000000, description: "cao khoảng 33-43cm, nặng tầm 8-10kg", category: "dog", origin: "Nhật Bản", stock: 50, Image: 'shiba.jpg' }
    ],
    cat: [
        { id: 10, name: "Mèo Ba tư", price: 3000000, description: "vẻ ngoài sang chảnh, bộ lông dài thướt tha", category: "cat", origin: "Iran", stock: 5, Image: 'batu.jpg' },
        { id: 11, name: "Mèo Sphynx không lông", price: 58000000, description: "không có lông, nhiều nếp nhăn, có cơ bắp", category: "cat", origin: "Canada", stock: 15, Image: 'sphynx.jpg' },
        { id: 12, name: "Mèo Anh lông dài", price: 2000000, description: "bộ lông mềm mại, đôi chân ngắn", category: "cat", origin: "Anh", stock: 8, Image: 'anh.jpg' },
        { id: 13, name: "Mèo Scottish Fold", price: 23000000, description: "tai cụp, thân thiện và thông minh", category: "cat", origin: "Scotland", stock: 10, Image: 'scottish.jpg' },
        { id: 14, name: "Mèo Bengal", price: 27500000, description: "bộ lông có hoa văn giống báo rừng, thích leo trèo", category: "cat", origin: "Mỹ", stock: 20, Image: 'bengal.jpg' },
        { id: 15, name: "Mèo Munchkin", price: 23000000, description: "có đôi chân ngắn dáng đi ngộ nghĩnh, đáng yêu", category: "cat", origin: "Mỹ", stock: 10, Image: 'munchkin.jpg' },
        { id: 16, name: "Mèo Xiêm", price: 4000000, description: "mắt màu xanh, lanh lợi, thông minh", category: "cat", origin: "Thái Lan", stock: 8, Image: 'xiem.jpg' },
        { id: 17, name: "Mèo Maine Coon", price: 45000000, description: "kích thước lớn, thân thiện và thông minh", category: "cat", origin: "Mỹ", stock: 5, Image: 'maine.jpg' },
        { id: 18, name: "Mèo Abyssinian", price: 13500000, description: "dáng thanh thoát, hoạt bát, tò mò", category: "cat", origin: "Ethiopia", stock: 11, Image: 'abyssinian.jpg' }
    ],
    food: [
        { id: 19, name: "Thức ăn hạt Royal Canin", price: 270000, object: "dùng cho cả chó và mèo", category: "food", origin: "Pháp", stock: 50, Image: 'royal.jpg' },
        { id: 20, name: "Pate Whiskas", price: 30000, object: "dùng cho mèo", category: "food", origin: "Anh/Mỹ", stock: 47, Image: 'whiskas.jpg' },
        { id: 21, name: "Xương gặm Pedigree Dentastix", price: 100000, object: "dùng cho chó", category: "food", origin: "Mỹ", stock: 70, Image: 'pedigree.jpg' },
        { id: 22, name: "Thức ăn hạt SmartHeart", price: 120000, object: "dùng cho cả chó và mèo", category: "food", origin: "Thái Lan", stock: 30, Image: 'smartheart.jpg' },
        { id: 23, name: "Thức ăn hạt Ganador", price: 150000, object: "dùng cho chó", category: "food", origin: "Pháp", stock: 20, Image: 'ganador.jpg' },
        { id: 24, name: "Pate/Thức ăn ướt Me-O", price: 27000, object: "dùng cho mèo", category: "food", origin: "Thái Lan", stock: 50, Image: 'meo.jpg' }
    ],
    other: [
        { id: 25, name: "Balo Phi Hành Gia", price: 300000, description: "trong suốt, giúp thú cưng dễ quan sát bên ngoài", category: "other", object: "mèo/chó nhỏ", stock: 22, Image: 'balo.jpg' },
        { id: 26, name: "Lồng Vận Chuyển Nhựa", price: 500000, description: "lồng cứng cáp đảm bảo khi vận chuyển các bé đi xa", category: "other", object: "mèo/chó", stock: 30, Image: 'long.jpg' },
        { id: 27, name: "Cần Câu Mèo", price: 60000, description: "kích thích bản năng săn mồi của mèo", category: "other", object: "mèo", stock: 30, Image: 'can.jpg' },
        { id: 28, name: "Đèn Laser", price: 70000, description: "điểm sáng để mèo đuổi bắt, vận động", category: "other", object: "mèo", stock: 20, Image: 'den.jpg' },
        { id: 29, name: "Bóng Cao Su Đặc/Tennis", price: 65000, description: "bóng bằng cao su ném cho chó bắt", category: "other", object: "chó", stock: 30, Image: 'bong.jpg' },
        { id: 30, name: "Đồ Chơi Gặm", price: 90000, description: "giúp chó thỏa mãn nhu cầu gặm, làm sạch răng", category: "other", object: "chó", stock: 45, Image: 'dochoi.jpg' }
    ]
}
function getAllProducts() {
    return [...products.dog, ...products.cat, ...products.food, ...products.other]
}
function getProductsById(id) {
    const allProducts = getDynamicProducts();
    return allProducts.find(p => String(p.id) === String(id));
}
//hàm lấy category của sản phẩm 
function getProductsCategory(id) {
    for (let category in products)
        if (products[category].find(p => p.id === id))
            return category;
    return null;
}
function getDynamicProducts() //đọc dữ liệu từ localStorage
{
    let productsJSON = localStorage.getItem('products');

    // Kiểm tra xem localStorage có trống không
    if (!productsJSON) {
        // Nếu trống, lấy danh sách sản phẩm đầy đủ từ hàm getAllProducts()
        const allProducts = getAllProducts(); 

        // Chuyển nó thành chuỗi JSON
        productsJSON = JSON.stringify(allProducts);

        // Lưu chuỗi này vào localStorage với key là 'products'
        localStorage.setItem('products', productsJSON);

        // Trả về danh sách sản phẩm đầy đủ
        return allProducts;
    }

    // Nếu localStorage đã có dữ liệu, chỉ cần đọc và trả về
    return JSON.parse(productsJSON);
}
//lọc danh mục
function filterProductsByCategory(category) {
    const allProducts = getDynamicProducts();
    return allProducts.filter(p => p.category === category && !p.hidden);
}
//lọc theo tên
function searchProductsByName(keyword) {
    const allProducts = getAllProducts();
    const lowerCaseKeyword = keyword.toLowerCase();
    return allProducts.filter(p => p.name.toLowerCase().includes(lowerCaseKeyword));
}