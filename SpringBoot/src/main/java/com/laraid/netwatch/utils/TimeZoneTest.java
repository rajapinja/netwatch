package com.laraid.netwatch.utils;

public class TimeZoneTest {

    public static void init() {
        System.out.println(">>>> JVM TimeZone: " + java.util.TimeZone.getDefault().getID());
    }

    public static void main(String[] args) {
        init();
    }
}
