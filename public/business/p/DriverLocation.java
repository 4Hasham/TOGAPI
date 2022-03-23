package p;
public class DriverLocation {

    private int tID;
    private double lat;
    private double lng;

    public DriverLocation() {}
    public DriverLocation(int tID, double lat, double lng) {
        this.tID = tID;
        this.lat = lat;
        this.lng = lng;
    }
    public int gettID() {
        return tID;
    }
    public void settID(int tID) {
        this.tID = tID;
    }
    public double getLat() {
        return lat;
    }
    public void setLat(double lat) {
        this.lat = lat;
    }
    public double getLng() {
        return lng;
    }
    public void setLng(double lng) {
        this.lng = lng;
    }
}
