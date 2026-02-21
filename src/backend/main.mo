import Map "mo:core/Map";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Array "mo:core/Array";

actor {
  type Poem = {
    id : Nat;
    title : Text;
    content : Text;
    author : Text;
    dateCreated : Time.Time;
  };

  module Poem {
    public func compare(a : Poem, b : Poem) : Order.Order {
      Text.compare(a.title, b.title);
    };
  };

  let poems = Map.empty<Nat, Poem>();
  var poemIdCounter = 0;

  public shared ({ caller }) func submitPoem(title : Text, content : Text, author : Text) : async () {
    let newPoem : Poem = {
      id = poemIdCounter;
      title;
      content;
      author;
      dateCreated = Time.now();
    };

    poems.add(poemIdCounter, newPoem);
    poemIdCounter += 1;
  };

  public query ({ caller }) func getAllPoems() : async [Poem] {
    poems.values().toArray().sort();
  };

  public query ({ caller }) func getPoemById(id : Nat) : async Poem {
    switch (poems.get(id)) {
      case (null) { Runtime.trap("Poem not found") };
      case (?poem) { poem };
    };
  };
};
