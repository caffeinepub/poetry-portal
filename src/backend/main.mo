import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type UserProfile = { name : Text };

  public type CollectionView = {
    id : Nat;
    name : Text;
    description : Text;
    dateCreated : Time.Time;
    poemIds : [Nat];
  };

  public type Poem = {
    id : Nat;
    title : Text;
    content : Text;
    author : Text;
    dateCreated : Time.Time;
    poemType : PoemType;
    imageUrl : ?Storage.ExternalBlob;
  };

  public type PoemType = { #text; #image };

  public type Collection = {
    id : Nat;
    name : Text;
    description : Text;
    dateCreated : Time.Time;
    poemIds : Map.Map<Nat, {}>;
  };

  public type PoemSearchResult = { poem : Poem; collectionNames : [Text] };

  public type Notification = {
    message : Text;
    timestamp : Time.Time;
    read : Bool;
  };

  let poems = Map.empty<Nat, Poem>();
  let collections = Map.empty<Nat, Collection>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let notifications = Map.empty<Principal, List.List<Notification>>();
  var poemIdCounter = 0;
  var collectionIdCounter = 0;

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func submitPoem(
    title : Text,
    content : Text,
    author : Text,
    poemType : PoemType,
    imageUrl : ?Storage.ExternalBlob,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit poems");
    };
    let newPoem : Poem = {
      id = poemIdCounter;
      title;
      content;
      author;
      dateCreated = Time.now();
      poemType;
      imageUrl;
    };
    poems.add(poemIdCounter, newPoem);
    let notification : Notification = {
      message = "New poem added: " # title;
      timestamp = Time.now();
      read = false;
    };
    for ((user, _) in userProfiles.entries()) {
      let userNotifications = switch (notifications.get(user)) {
        case (null) { List.empty<Notification>() };
        case (?existing) { existing };
      };
      userNotifications.add(notification);
      notifications.add(user, userNotifications);
    };
    poemIdCounter += 1;
    poemIdCounter - 1;
  };

  public shared ({ caller }) func markNotificationAsRead(index : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications");
    };
    switch (notifications.get(caller)) {
      case (null) { Runtime.trap("No notifications found") };
      case (?userNotifications) {
        if (index >= userNotifications.size()) {
          Runtime.trap("Notification index out of bounds");
        };
        let notificationsArray = userNotifications.toArray();
        let updatedArray = Array.tabulate(
          notificationsArray.size(),
          func(i) {
            if (i == index) {
              {
                notificationsArray[i] with
                read = true;
              };
            } else {
              notificationsArray[i];
            };
          },
        );
        notifications.add(caller, List.fromArray<Notification>(updatedArray));
      };
    };
  };

  public query ({ caller }) func getAllPoems() : async [Poem] {
    poems.values().toArray();
  };

  public query ({ caller }) func getPoemById(id : Nat) : async Poem {
    switch (poems.get(id)) {
      case (null) { Runtime.trap("Poem not found") };
      case (?poem) { poem };
    };
  };

  public query ({ caller }) func getNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };
    switch (notifications.get(caller)) {
      case (null) { [] };
      case (?userNotifications) { userNotifications.toArray() };
    };
  };

  public query ({ caller }) func getUnreadNotificationsCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };
    switch (notifications.get(caller)) {
      case (null) { 0 };
      case (?userNotifications) {
        var count = 0;
        for (notification in userNotifications.values()) {
          if (not notification.read) { count += 1 };
        };
        count;
      };
    };
  };

  public query ({ caller }) func getAllCollections() : async [CollectionView] {
    collections.values().toArray().map<Collection, CollectionView>(
      func(collection) {
        {
          collection with
          poemIds = collection.poemIds.keys().toArray();
        };
      }
    );
  };

  public query ({ caller }) func getPoemsByCollectionId(collectionId : Nat) : async [Poem] {
    switch (collections.get(collectionId)) {
      case (null) { Runtime.trap("Collection not found") };
      case (?collection) {
        let poemList = List.empty<Poem>();
        for (poemId in collection.poemIds.keys()) {
          switch (poems.get(poemId)) {
            case (null) {};
            case (?poem) { poemList.add(poem) };
          };
        };
        poemList.toArray();
      };
    };
  };

  public shared ({ caller }) func removePoemFromCollection(
    collectionId : Nat,
    poemId : Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove poems from collections");
    };
    switch (collections.get(collectionId)) {
      case (null) { Runtime.trap("Collection not found") };
      case (?collection) {
        if (not collection.poemIds.containsKey(poemId)) {
          Runtime.trap("Poem not in collection");
        };
        let updatedPoemIds = collection.poemIds.clone();
        updatedPoemIds.remove(poemId);
        collections.add(
          collectionId,
          {
            collection with
            poemIds = updatedPoemIds
          },
        );
      };
    };
  };

  public shared ({ caller }) func deleteCollection(collectionId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete collections");
    };
    switch (collections.containsKey(collectionId)) {
      case (true) {
        collections.remove(collectionId);
      };
      case (false) {
        Runtime.trap("Collection does not exist");
      };
    };
  };

  public query ({ caller }) func searchPoems(searchTerm : Text) : async [PoemSearchResult] {
    let lowerSearchTerm = searchTerm.toLower();
    let results = List.empty<PoemSearchResult>();

    for (poem in poems.values()) {
      let matchesTitle = poem.title.toLower().contains(#text lowerSearchTerm);
      let matchesContent = poem.content.toLower().contains(#text lowerSearchTerm);
      let matchesAuthor = poem.author.toLower().contains(#text lowerSearchTerm);

      var matchesCollection = false;
      let collectionNames = List.empty<Text>();
      for (collection in collections.values()) {
        if (collection.poemIds.containsKey(poem.id)) {
          collectionNames.add(collection.name);
          if (collection.name.toLower().contains(#text lowerSearchTerm)) {
            matchesCollection := true;
          };
        };
      };

      if (matchesTitle or matchesContent or matchesAuthor or matchesCollection) {
        results.add({
          poem;
          collectionNames = collectionNames.toArray();
        });
      };
    };
    results.toArray();
  };

  public shared ({ caller }) func createCollection(name : Text, description : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create collections");
    };
    let newCollection : Collection = {
      id = collectionIdCounter;
      name;
      description;
      dateCreated = Time.now();
      poemIds = Map.empty<Nat, {}>();
    };
    collections.add(collectionIdCounter, newCollection);
    collectionIdCounter += 1;
    collectionIdCounter - 1;
  };

  public shared ({ caller }) func addPoemToCollection(collectionId : Nat, poemId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add poems to collections");
    };
    if (not poems.containsKey(poemId)) {
      Runtime.trap("Poem does not exist");
    };
    switch (collections.get(collectionId)) {
      case (null) { Runtime.trap("Collection not found") };
      case (?collection) {
        let updatedPoemIds = collection.poemIds.clone();
        updatedPoemIds.add(poemId, {});
        collections.add(
          collectionId,
          {
            collection with
            poemIds = updatedPoemIds
          },
        );
      };
    };
  };

  // Util function for migration
  public func updatePoem(poemId : Nat, newPoem : Poem) {
    poems.add(poemId, newPoem);
  };
};
