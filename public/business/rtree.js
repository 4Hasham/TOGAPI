const MAX_ENTRIES = 3;

class TreeNode {
    constructor(latitude, longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.ID = 0;
        this.children = [];
    }
}

class RTree {
    constructor(latitude, longitude) {
        this.root = new TreeNode(latitude, longitude);
    }


}