package p;
import java.util.ArrayList;
import java.util.List;
import com.github.davidmoten.rtree2.geometry.Geometries;
import com.github.davidmoten.rtree2.geometry.Point;
import com.github.davidmoten.rtree2.geometry.Rectangle;
import com.google.code.geocoder.model.LatLng;
import com.github.davidmoten.grumpy.core.Position;
import com.github.davidmoten.rtree2.Entry;
import com.github.davidmoten.rtree2.Iterables;
import com.github.davidmoten.rtree2.RTree;

public class RTreeMap {

    private ArrayList<DriverLocation> driverLocations;

    public RTreeMap(ArrayList<DriverLocation> drivers, LatLng cust) {
        RTree<String, Point> tree = RTree.star().create();
        for(int i = 0; i < drivers.size(); ++i)
            tree = tree.add(Integer.toString(drivers.get(i).gettID()), Geometries.point(drivers.get(i).getLng(), drivers.get(i).getLat()));
        Point c = Geometries.point(cust.getLng().doubleValue(), cust.getLat().doubleValue());
        final double distanceKm = 1;
        List<Entry<String, Point>> list = Iterables.toList(search(tree, c, distanceKm));
        driverLocations = new ArrayList<>();
        for(int i = 0; i < list.size(); ++i) {
            if(list.get(i).value() != null && list.get(i).geometry() != null) {
                DriverLocation e = new DriverLocation(Integer.parseInt(list.get(i).value()), list.get(i).geometry().y(), list.get(i).geometry().x());
                driverLocations.add(e);
            }
        }
    }

    public ArrayList<DriverLocation> getDriverLocations() {
        return driverLocations;
    }

    public static void main(String[] args) {
        System.out.println("hello");
    }

    public static <T> Iterable<Entry<T, Point>> search(RTree<T, Point> tree, Point lonLat, final double distanceKm) {
        // First we need to calculate an enclosing lat long rectangle for this
        // distance then we refine on the exact distance
        final Position from = Position.create(lonLat.y(), lonLat.x());
        Rectangle bounds = createBounds(from, distanceKm);

        return Iterables.filter(tree
                        // do the first search using the bounds
                        .search(bounds),
                // refine using the exact distance
                entry -> {
                    Point p = entry.geometry();
                    Position position = Position.create(p.y(), p.x());
                    return from.getDistanceToKm(position) < distanceKm;
                });
    }

    private static Rectangle createBounds(final Position from, final double distanceKm) {
        // this calculates a pretty accurate bounding box. Depending on the
        // performance you require you wouldn't have to be this accurate because
        // accuracy is enforced later
        Position north = from.predict(distanceKm, 0);
        Position south = from.predict(distanceKm, 180);
        Position east = from.predict(distanceKm, 90);
        Position west = from.predict(distanceKm, 270);

        return Geometries.rectangle(west.getLon(), south.getLat(), east.getLon(), north.getLat());
    }

    private static <T> RTree<GeoCircleValue<T>, Rectangle> add(RTree<GeoCircleValue<T>, Rectangle> tree,
                                                               GeoCircleValue<T> c) {
        return tree.add(c, createBounds(Position.create(c.lat, c.lon), c.radiusKm));
    }

    private static class GeoCircleValue<T> {

        GeoCircleValue(float lat, float lon, double radiusKm, T value) {
            this.lat = lat;
            this.lon = lon;
            this.radiusKm = radiusKm;
            this.value = value;
        }

        float lat;
        float lon;
        double radiusKm;
        T value;
    }
}
